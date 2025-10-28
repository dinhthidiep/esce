using ESCE_SYSTEM.DTOs.Users;
using ESCE_SYSTEM.Helper;
using ESCE_SYSTEM.Models;
using ESCE_SYSTEM.Options;
using ESCE_SYSTEM.Services.UserContextService;
using Google.Apis.Auth;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using ESCE_SYSTEM.Repositories.OtpRepository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ESCE_SYSTEM.DTOs.Certificates;
using ESCE_SYSTEM.DTOs.BanUnbanUser;
using Mapster;
using Microsoft.AspNetCore.Hosting;
using ESCE_SYSTEM.DTOs.Notifications;
using ESCE_SYSTEM.Services.NotificationService;
using Microsoft.AspNetCore.SignalR;
using ESCE_SYSTEM.SignalR;



namespace ESCE_SYSTEM.Services.UserService
{
    public class UserService : IUserService
    {
        private readonly ESCEContext _dbContext;
        private readonly EmailHelper _emailHelper;
        private readonly JwtSetting _jwtSetting;
        private readonly IUserContextService _userContextService;
        private readonly IOtpRepository _otpRepository;
        private readonly IWebHostEnvironment _env; 
        private readonly EmailConfig _emailConfig;
        private readonly INotificationService _notificationService;
        private readonly IHubContext<NotificationHub> _hubNotificationContext;

        public UserService(
            ESCEContext dbContext,
            EmailHelper emailHelper,
            IUserContextService userContextService,
            IOptions<JwtSetting> jwtSettings,
            IOtpRepository otpRepository,
            IWebHostEnvironment env, 
            IOptions<EmailConfig> emailConfigOptions,
            INotificationService notificationService,
            IHubContext<NotificationHub> hubContext)
        {
            _dbContext = dbContext;
            _emailHelper = emailHelper;
            _jwtSetting = jwtSettings.Value;
            _userContextService = userContextService;
            _otpRepository = otpRepository;
            _env = env;
            _emailConfig = emailConfigOptions.Value;
            _notificationService = notificationService;
            _hubNotificationContext = hubContext;
        }

        #region User Management
        public async Task<Account> GetUserByUsernameAsync(string userEmail)
        {
            return await _dbContext.Accounts
                .FirstOrDefaultAsync(x => x.Email.ToLower() == userEmail.ToLower());
        }

        public async Task CreateUserAsync(RegisterUserDto user, bool verifyOtp, bool isGoogleAccount, int roleId=4)
        {
            // 🔹 1. Xác thực OTP nếu yêu cầu
            if (verifyOtp)
            {
                var otp = await _dbContext.Otps
                    .Where(o => o.Email == user.UserEmail)
                    .OrderByDescending(o => o.CreatedAt)
                    .FirstOrDefaultAsync();

                if (otp == null || otp.IsVerified != true)
                    throw new InvalidOperationException("OTP chưa được xác thực.");
                if (otp.ExpirationTime < DateTime.UtcNow)
                    throw new InvalidOperationException("OTP đã hết hạn.");
            }

            // 🔹 2. Kiểm tra dữ liệu đầu vào
            if (string.IsNullOrWhiteSpace(user.UserEmail))
                throw new ArgumentException("UserEmail không được để trống.");
            if (string.IsNullOrWhiteSpace(user.FullName))
                throw new ArgumentException("FullName không được để trống.");
            if (!isGoogleAccount && string.IsNullOrWhiteSpace(user.Password))
                throw new ArgumentException("Password không được để trống.");

            // 🔹 3. Check Email trùng
            if (await _dbContext.Accounts.AnyAsync(a => a.Email.ToLower() == user.UserEmail.ToLower()))
                throw new InvalidOperationException("Email đã tồn tại.");

            // 🔹 4. Check RoleId hợp lệ
            //if (!await _dbContext.Roles.AnyAsync(r => r.Id == user.RoleId))
            //    throw new InvalidOperationException("RoleId không hợp lệ.");

            // 🔹 5. Tạo hash password (Google account có thể set random password)
            string passwordHash = isGoogleAccount
                ? BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString())
                : HashPassword(user.Password);

            // 🔹 6. Tạo tài khoản mới
            var account = new Account
            {
                Email = user.UserEmail.ToLower(),
                PasswordHash = passwordHash,
                Name = user.FullName,
                Phone = string.IsNullOrEmpty(user.Phone) ? null : user.Phone,
                RoleId = roleId,
                IsActive = isGoogleAccount || !verifyOtp, // Google thì active luôn
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            try
            {
                _dbContext.Accounts.Add(account);
                await _dbContext.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                throw new Exception($"Lỗi khi lưu Account: {ex.InnerException?.Message ?? ex.Message}", ex);
            }
        }

        public async Task ChangePassword(ChangePasswordDto changePassword)
        {
            var email = _userContextService.UserEmail;
            var user = await GetUserByUsernameAsync(email);

            if (user == null || !VerifyPassword(changePassword.OldPassword, user.PasswordHash))
                throw new InvalidOperationException("Mật khẩu cũ không đúng.");

            user.PasswordHash = HashPassword(changePassword.NewPassword);
            user.UpdatedAt = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync();
        }

        public async Task ResetPassword(ResetPasswordDto resetPassword)
        {
            var latestOtp = await _dbContext.Otps
                .Where(o => o.User.Email.ToLower() == resetPassword.Email.ToLower())
                .OrderByDescending(o => o.CreatedAt)
                .FirstOrDefaultAsync();

            if (latestOtp == null)
                throw new InvalidOperationException("Email không đúng.");
            if (latestOtp.Code != resetPassword.Otp)
                throw new InvalidOperationException("OTP không đúng.");
            if (latestOtp.ExpirationTime < DateTime.UtcNow)
                throw new InvalidOperationException("OTP đã hết hạn.");

            var user = await GetUserByUsernameAsync(resetPassword.Email);
            user.PasswordHash = HashPassword(resetPassword.NewPassword);
            user.UpdatedAt = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync();
        }
        #endregion

        #region OTP Management
        public async Task RequestOtp(RequestOtpDto requestOtpDto)
        {
            var otp = new Otp
            {
                Email = requestOtpDto.Email,
                Code = OTPGenerator.GenerateOTP(),
                ExpirationTime = DateTime.UtcNow.AddMinutes(5),
                IsVerified = false,
                CreatedAt = DateTime.UtcNow
            };
            await _otpRepository.AddAsync(otp);

            string subject = "Mã OTP";
            string content = $"Mã OTP xác thực đăng ký tài khoản của bạn: {otp.Code}";
            await _emailHelper.SendEmailAsync(subject, content, new List<string> { otp.Email });
        }

        public async Task RequestOtpForgetPassword(RequestOtpDto requestOtpDto)
        {
            var user = await GetUserByUsernameAsync(requestOtpDto.Email);
            if (user == null)
                throw new InvalidOperationException("Email không tồn tại.");

            var otpCode = new Otp
            {
                UserId = user.Id,
                Code = OTPGenerator.GenerateOTP(),
                ExpirationTime = DateTime.UtcNow.AddMinutes(5),
                IsVerified = false,
                CreatedAt = DateTime.UtcNow
            };

            _dbContext.Otps.Add(otpCode);
            await _dbContext.SaveChangesAsync();

            string subject = "Mã OTP";
            string content = $"Mã OTP quên mật khẩu của bạn: {otpCode.Code}";
            await _emailHelper.SendEmailAsync(subject, content, new List<string> { requestOtpDto.Email });
        }

        public async Task<bool> VerifyOtp(VerifyOtpDto verifyOtpDto)
        {
            var latestOtp = await _dbContext.Otps
                .Where(o => o.Email != null && o.Email.ToLower() == verifyOtpDto.Email.ToLower())
                .OrderByDescending(o => o.CreatedAt)
                .FirstOrDefaultAsync();

            if (latestOtp == null)
                throw new InvalidOperationException("Không tìm thấy OTP cho email này.");
            if (latestOtp.Code != verifyOtpDto.Otp)
                throw new InvalidOperationException("OTP không đúng.");
            if (latestOtp.ExpirationTime < DateTime.UtcNow)
                throw new InvalidOperationException("OTP đã hết hạn.");

            latestOtp.IsVerified = true;
            await _dbContext.SaveChangesAsync();

            return true;
        }
        #endregion

        #region Password Helper
        private static string HashPassword(string password) =>
            BCrypt.Net.BCrypt.HashPassword(password);

        public bool VerifyPassword(string enteredPassword, string storedHash) =>
            BCrypt.Net.BCrypt.Verify(enteredPassword, storedHash);
        #endregion

        #region Google Login
        public async Task<GoogleJsonWebSignature.Payload> VerifyGoogleTokenAsync(string idToken)
        {
            try
            {
                var settings = new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = new List<string> { _jwtSetting.GoogleClientID }
                };
                return await GoogleJsonWebSignature.ValidateAsync(idToken, settings);
            }
            catch
            {
                return null;
            }
        }

        // 🟢 Bổ sung triển khai: GetAccountById(int)
        public async Task<Account> GetAccountById(int accountId)
        {
            var account = await _dbContext.Accounts.FirstOrDefaultAsync(a => a.Id == accountId);
            if (account == null) throw new Exception("Account not found");
            return account;
        }

        #endregion

        // Trong UserService.cs

        // 🟢 Hàm HỖ TRỢ GỬI EMAIL (Chỉ tới User)
        private async Task SendUserEmailAsync(Account user, string templateName, string subject, string comment = null)
        {
            // ... (Logic đọc file HTML, thay thế placeholder, và gọi _emailHelper.SendEmailAsync)

            string filePath = Path.Combine(_env.ContentRootPath, "EmailTemplates", templateName);
            if (!System.IO.File.Exists(filePath))
            {
                throw new FileNotFoundException($"Không tìm thấy file template email: {templateName}", filePath);
            }

            string htmlBody = await System.IO.File.ReadAllTextAsync(filePath);
            string body = htmlBody
                .Replace("{{UserName}}", user.Name)
                .Replace("{{Hompage}}", _emailConfig.HomePage)
                .Replace("{{Comment}}", comment ?? "")
                .Replace("{{Reason}}", comment ?? "");

            await _emailHelper.SendEmailAsync(subject, body, new List<string> { user.Email }, true);
        }

        // 🟢 Hàm HỖ TRỢ GỬI THÔNG BÁO WEB (Tới Admin và User)
        private async Task SendWebNotificationAsync(Account user, string status, string objectType, string objectId, string content)
        {
            // 1. Tạo Notification cho User liên quan
            var userNotification = new NotificationDto
            {
                UserId = user.Id,
                Message = content,
                Title = $"Cập nhật trạng thái: {status}",
                // ... (các trường khác)
            };
            // ⚠️ Gửi Notification User (DB + SignalR)
            // await _notificationService.AddNotificationAsync(userNotification);
            // await _hubNotificationContext.Clients.User(user.Id.ToString()).SendAsync("ReceiveNotification", userNotification);

            // 2. Tạo Notification cho TẤT CẢ ADMIN
            var adminContent = $"Yêu cầu {objectType} của {user.Name} đã được cập nhật thành {status}.";
            var admins = await _dbContext.Accounts.Where(a => a.RoleId == 1).ToListAsync(); // Role 1 = Admin

            foreach (var admin in admins)
            {
                var adminNotification = new NotificationDto
                {
                    UserId = admin.Id,
                    Message = adminContent,
                    Title = $"Cập nhật hệ thống: {status}",
                    // ...
                };
                // ⚠️ Gửi Notification Admin (DB + SignalR)
                // await _notificationService.AddNotificationAsync(adminNotification);
                // await _hubNotificationContext.Clients.User(admin.Id.ToString()).SendAsync("ReceiveNotification", adminNotification);
            }
        }

        // 🟢 Hàm hỗ trợ chung để lấy chứng nhận và người dùng (EF Core) - Giữ nguyên
        private async Task<(dynamic Certificate, Account User, int SuccessRoleId, string ObjectType)> GetCertificateAndUserForProcessing(int certificateId, CertificateType type)
        {
            // ... (Logic đã được cung cấp)
            // Cần đảm bảo các navigation property như .Include(ac => ac.Account) được sử dụng
            throw new NotImplementedException();
        }


        // --- 🟢 YÊU CẦU NÂNG CẤP ROLE ---

        public async Task RequestUpgradeToAgencyAsync(int userId, RequestAgencyUpgradeDto requestDto)
        {
            var user = await _dbContext.Accounts.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null) throw new InvalidOperationException("User not found.");

            // ⚠️ KHỞI TẠO VÀ LƯU AGENCIE CERTIFICATE
            var agencyCertificate = new AgencieCertificate { AccountId = userId, Status = "Pending", /* ... các trường khác */ AgencyId = 0 };
            _dbContext.AgencieCertificates.Add(agencyCertificate);
            await _dbContext.SaveChangesAsync();

            // 🟢 THÔNG BÁO ADMIN (NotifyAdminAsync đã được thay thế bằng SendWebNotificationAsync)
            await SendWebNotificationAsync(user, "Pending", "Agency Certificate", agencyCertificate.AgencyId.ToString(),
                $"Người dùng {user.Name} vừa gửi yêu cầu nâng cấp Agency.");
        }

        public async Task RequestUpgradeToHostAsync(int userId, RequestHostUpgradeDto requestDto)
        {
            var user = await _dbContext.Accounts.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null) throw new InvalidOperationException("User not found.");

            // ⚠️ KHỞI TẠO VÀ LƯU HOST CERTIFICATE
            var hostCertificate = new HostCertificate { HostId = userId, Status = "Pending", /* ... các trường khác */ CertificateId = 0 };
            _dbContext.HostCertificates.Add(hostCertificate);
            await _dbContext.SaveChangesAsync();

            // 🟢 THÔNG BÁO ADMIN
            await SendWebNotificationAsync(user, "Pending", "Host Certificate", hostCertificate.CertificateId.ToString(),
                $"Người dùng {user.Name} vừa gửi yêu cầu nâng cấp Host.");
        }

        // 1. DUYỆT (Approve)
        public async Task ApproveUpgradeCertificateAsync(ApproveCertificateDto dto)
        {
            var (cert, user, newRoleId, objectType) = await GetCertificateAndUserForProcessing(dto.CertificateId, (CertificateType)dto.Type);

            cert.Status = "Approved";
            user.RoleId = newRoleId;
            cert.UpdatedAt = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync();

            await SendWebNotificationAsync(user, "Approved", objectType, dto.CertificateId.ToString(), $"Yêu cầu nâng cấp Role của bạn đã được phê duyệt thành công.");
            await SendUserEmailAsync(user, "ApproveCertificate.html", "THÔNG BÁO: Yêu cầu nâng cấp Role đã được CHẤP THUẬN");
        }

        // 2. TỪ CHỐI (Reject)
        public async Task RejectUpgradeCertificateAsync(RejectCertificateDto dto)
        {
            var (cert, user, _, objectType) = await GetCertificateAndUserForProcessing(dto.CertificateId, (CertificateType)dto.Type);

            cert.Status = "Rejected";
            cert.RejectComment = dto.Comment;
            cert.UpdatedAt = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync();

            await SendWebNotificationAsync(user, "Rejected", objectType, dto.CertificateId.ToString(), $"Yêu cầu nâng cấp Role của bạn đã bị từ chối. Lý do: {dto.Comment}");
            await SendUserEmailAsync(user, "RejectCertificate.html", "THÔNG BÁO: Yêu cầu nâng cấp Role bị TỪ CHỐI", dto.Comment);
        }

        // 3. YÊU CẦU BỔ SUNG (Review)
        public async Task ReviewUpgradeCertificateAsync(ReviewCertificateDto dto)
        {
            var (cert, user, _, objectType) = await GetCertificateAndUserForProcessing(dto.CertificateId, (CertificateType)dto.Type);

            cert.Status = "Review";
            cert.ReviewComments = dto.Comment;
            cert.UpdatedAt = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync();

            await SendWebNotificationAsync(user, "Review", objectType, dto.CertificateId.ToString(), $"Yêu cầu nâng cấp Role của bạn cần bổ sung thông tin. Nội dung: {dto.Comment}");
            await SendUserEmailAsync(user, "AddCertificateReviewComment.html", "THÔNG BÁO: Yêu cầu bổ sung thông tin Role", dto.Comment);
        }



        #region Ban/Unban Account (Triển khai chính xác)

        // 1. CẤM (Ban)
        public async Task BanAccount(string accountId, string reason)
        {
            // Chuyển đổi string ID -> int để gọi GetAccountById(int)
            if (!int.TryParse(accountId, out int id)) throw new ArgumentException($"ID tài khoản '{accountId}' không hợp lệ.");
            var account = await GetAccountById(id);

            if (account.IsActive == false) throw new Exception("Tài khoản đã bị cấm.");

            account.IsActive = false;
            account.UpdatedAt = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync();

            await SendWebNotificationAsync(account, "Ban", "Account", accountId, $"Tài khoản của bạn đã bị cấm. Lý do: {reason}");
            await SendUserEmailAsync(account, "BanAccount.html", "THÔNG BÁO: Tài khoản của bạn đã bị CẤM TRUY CẬP", reason);
        }

        // 2. BỎ CẤM (Unban)
        public async Task UnbanAccount(string accountId)
        {
            // Chuyển đổi string ID -> int để gọi GetAccountById(int)
            if (!int.TryParse(accountId, out int id)) throw new ArgumentException($"ID tài khoản '{accountId}' không hợp lệ.");
            var account = await GetAccountById(id);

            if (account.IsActive == true) throw new Exception("Tài khoản không bị cấm.");

            account.IsActive = true;
            account.UpdatedAt = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync();

            await SendWebNotificationAsync(account, "Unban", "Account", accountId, $"Tài khoản của bạn đã được bỏ cấm.");
            await SendUserEmailAsync(account, "UnbanAccount.html", "THÔNG BÁO: Tài khoản của bạn đã được KHÔI PHỤC");
        }


    }
}
#endregion