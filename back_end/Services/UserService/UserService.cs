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

namespace ESCE_SYSTEM.Services.UserService
{
    public class UserService : IUserService
    {
        private readonly ESCEContext _dbContext;
        private readonly EmailHelper _emailHelper;
        private readonly JwtSetting _jwtSetting;
        private readonly IUserContextService _userContextService;
        private readonly IOtpRepository _otpRepository;

        public UserService(
            ESCEContext dbContext,
            EmailHelper emailHelper,
            IUserContextService userContextService,
            IOptions<JwtSetting> jwtSettings,
            IOtpRepository otpRepository)
        {
            _dbContext = dbContext;
            _emailHelper = emailHelper;
            _jwtSetting = jwtSettings.Value;
            _userContextService = userContextService;
            _otpRepository = otpRepository;
        }

        #region User Management
        public async Task<Account> GetUserByUsernameAsync(string userEmail)
        {
            return await _dbContext.Accounts
                .FirstOrDefaultAsync(x => x.Email.ToLower() == userEmail.ToLower());
        }

        public async Task CreateUserAsync(RegisterUserDto user, bool verifyOtp, bool isGoogleAccount)
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
            if (!await _dbContext.Roles.AnyAsync(r => r.Id == user.RoleId))
                throw new InvalidOperationException("RoleId không hợp lệ.");

            // 🔹 5. Tạo hash password (Google account có thể set random password)
            string passwordHash = isGoogleAccount
                ? BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString())
                : HashPassword(user.Password);

            // 🔹 6. Tạo hoặc cập nhật tài khoản
            var existingAccount = await _dbContext.Accounts
                .FirstOrDefaultAsync(a => a.Email.ToLower() == user.UserEmail.ToLower());
            
            if (existingAccount != null && existingAccount.Name == "Temp User")
            {
                // Cập nhật user tạm thời thành user thật
                existingAccount.Name = user.FullName;
                existingAccount.PasswordHash = passwordHash;
                existingAccount.Phone = string.IsNullOrEmpty(user.Phone) ? null : user.Phone;
                existingAccount.RoleId = user.RoleId;
                existingAccount.IsActive = isGoogleAccount || !verifyOtp;
                existingAccount.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                // Tạo tài khoản mới
                var account = new Account
                {
                    Email = user.UserEmail.ToLower(),
                    PasswordHash = passwordHash,
                    Name = user.FullName,
                    Phone = string.IsNullOrEmpty(user.Phone) ? null : user.Phone,
                    RoleId = user.RoleId,
                    IsActive = isGoogleAccount || !verifyOtp, // Google thì active luôn
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _dbContext.Accounts.Add(account);
            }

            try
            {
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
            // Tìm user đã tồn tại để lấy UserId
            var existingUser = await GetUserByUsernameAsync(requestOtpDto.Email);
            
            int userId;
            if (existingUser != null)
            {
                userId = existingUser.Id;
            }
            else
            {
                // Tạo user tạm thời cho đăng ký mới
                var tempUser = new Account
                {
                    Email = requestOtpDto.Email,
                    Name = "Temp User", // Tên tạm thời
                    PasswordHash = "temp", // Password tạm thời
                    RoleId = 4, // Customer role mặc định
                    IsActive = false, // Chưa active
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                
                _dbContext.Accounts.Add(tempUser);
                await _dbContext.SaveChangesAsync();
                userId = tempUser.Id;
            }
            
            var otp = new Otp
            {
                UserId = userId,
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
        #endregion
    }
}
