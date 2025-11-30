using ESCE_SYSTEM.DTOs.Users;
using ESCE_SYSTEM.Helper;
using ESCE_SYSTEM.Models;
using ESCE_SYSTEM.Options;
using ESCE_SYSTEM.Services.UserContextService;
using Google.Apis.Auth;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using ESCE_SYSTEM.Repositories.OtpRepository;
using ESCE_SYSTEM.DTOs.Certificates;
using Microsoft.AspNetCore.Hosting;
using ESCE_SYSTEM.DTOs.Notifications;
using Microsoft.AspNetCore.SignalR;
using ESCE_SYSTEM.SignalR;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Globalization;


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
        private readonly IHubContext<NotificationHub> _hubNotificationContext;

        public UserService(
            ESCEContext dbContext,
            EmailHelper emailHelper,
            IUserContextService userContextService,
            IOptions<JwtSetting> jwtSettings,
            IOtpRepository otpRepository,
            IWebHostEnvironment env,
            IOptions<EmailConfig> emailConfigOptions,
            IHubContext<NotificationHub> hubContext)
        {
            _dbContext = dbContext;
            _emailHelper = emailHelper;
            _jwtSetting = jwtSettings.Value;
            _userContextService = userContextService;
            _otpRepository = otpRepository;
            _env = env;
            _emailConfig = emailConfigOptions.Value;
            _hubNotificationContext = hubContext;
        }

        #region User Management
        public async Task<Account> GetUserByUsernameAsync(string userEmail)
        {
            if (string.IsNullOrWhiteSpace(userEmail))
            {
                throw new ArgumentException("Email cannot be null or empty");
            }

            return await _dbContext.Accounts
                .Include(account => account.Role) //  THÊM INCLUDE ROLE
                .FirstOrDefaultAsync(account => account.Email.ToLower() == userEmail.ToLower());
        }

        public async Task CreateUserAsync(RegisterUserDto user, bool verifyOtp, bool isGoogleAccount, int roleId = 4)
        {
            if (user == null)
            {
                throw new ArgumentNullException(nameof(user), "User data cannot be null");
            }

            if (string.IsNullOrWhiteSpace(user.UserEmail))
            {
                throw new ArgumentException("UserEmail cannot be null or empty");
            }

            if (!isGoogleAccount && string.IsNullOrWhiteSpace(user.Password))
            {
                throw new ArgumentException("Password cannot be null or empty for non-Google accounts");
            }

            // OTP verification
            if (verifyOtp)
            {
                var otp = await _dbContext.Otps
                    .Where(otpRecord => otpRecord.Email == user.UserEmail)
                    .OrderByDescending(otpRecord => otpRecord.CreatedAt)
                    .FirstOrDefaultAsync();

                if (otp == null || otp.IsVerified != true)
                {
                    throw new InvalidOperationException("OTP has not been verified");
                }

                if (otp.ExpirationTime < DateTime.UtcNow)
                {
                    throw new InvalidOperationException("OTP has expired");
                }
            }

            // Check duplicate email
            if (await _dbContext.Accounts.AnyAsync(account => account.Email.ToLower() == user.UserEmail.ToLower()))
            {
                throw new InvalidOperationException("Email already exists in the system");
            }

            // Create password hash
            string passwordHash = isGoogleAccount
                ? BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString())
                : HashPassword(user.Password);

            // Create new account

            var account = new Account
            {
                Email = user.UserEmail.ToLower().Trim(),
                PasswordHash = passwordHash,
                Name = string.IsNullOrWhiteSpace(user.FullName) ? null : user.FullName.Trim(),
                Phone = string.IsNullOrEmpty(user.Phone) ? null : user.Phone.Trim(),
                RoleId = roleId,
                IsActive = isGoogleAccount || !verifyOtp,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                
            };

            try
            {
                _dbContext.Accounts.Add(account);
                await _dbContext.SaveChangesAsync();
            }
            catch (DbUpdateException exception)
            {
                throw new Exception($"Error creating account: {exception.InnerException?.Message ?? exception.Message}", exception);
            }
        }

        public async Task<Account> CreateUserByAdminAsync(CreateUserAdminDto dto)
        {
            if (dto == null)
            {
                throw new ArgumentNullException(nameof(dto), "User data cannot be null");
            }

            if (string.IsNullOrWhiteSpace(dto.UserEmail))
            {
                throw new ArgumentException("UserEmail cannot be null or empty");
            }

            if (string.IsNullOrWhiteSpace(dto.Password))
            {
                throw new ArgumentException("Password cannot be null or empty");
            }

            if (await _dbContext.Accounts.AnyAsync(account => account.Email.ToLower() == dto.UserEmail.ToLower()))
            {
                throw new InvalidOperationException("Email already exists in the system");
            }

            var roleNameMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
            {
                { "Tourist", "Customer" },
                { "Customer", "Customer" },
                { "Host", "Host" },
                { "TravelAgency", "Agency" },
                { "Travel agency", "Agency" },
                { "Agency", "Agency" }
            };

            var normalizedRole = dto.Role?.Trim() ?? "Customer";
            var targetRoleName = roleNameMap.TryGetValue(normalizedRole, out var mappedRole)
                ? mappedRole
                : normalizedRole;

            var role = await _dbContext.Roles.FirstOrDefaultAsync(r => r.Name == targetRoleName);
            if (role == null)
            {
                throw new InvalidOperationException($"Role '{dto.Role}' không tồn tại trong hệ thống");
            }

            var account = new Account
            {
                Email = dto.UserEmail.ToLower().Trim(),
                PasswordHash = HashPassword(dto.Password),
                Name = string.IsNullOrWhiteSpace(dto.FullName) ? null : dto.FullName.Trim(),
                Phone = string.IsNullOrEmpty(dto.Phone) ? null : dto.Phone.Trim(),
                RoleId = role.Id,
                IsActive = dto.IsActive,
                IsBanned = dto.IsBanned,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            try
            {
                _dbContext.Accounts.Add(account);
                await _dbContext.SaveChangesAsync();
                return account;
            }
            catch (DbUpdateException exception)
            {
                throw new Exception($"Error creating account: {exception.InnerException?.Message ?? exception.Message}", exception);
            }
        }

        public async Task ChangePassword(ChangePasswordDto changePassword)
        {
            if (changePassword == null)
            {
                throw new ArgumentNullException(nameof(changePassword));
            }

            var email = _userContextService.UserEmail;
            if (string.IsNullOrEmpty(email))
            {
                throw new UnauthorizedAccessException("User not authenticated");
            }

            var user = await GetUserByUsernameAsync(email);
            if (user == null)
            {
                throw new InvalidOperationException("User does not exist");
            }

            if (!VerifyPassword(changePassword.OldPassword, user.PasswordHash))
            {
                throw new InvalidOperationException("Old password is incorrect");
            }

            user.PasswordHash = HashPassword(changePassword.NewPassword);
            user.UpdatedAt = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();
        }

        public async Task ResetPassword(ResetPasswordDto resetPassword)
        {
            if (resetPassword == null)
            {
                throw new ArgumentNullException(nameof(resetPassword));
            }

            var latestOtp = await _dbContext.Otps
                .Where(otp => otp.User.Email.ToLower() == resetPassword.Email.ToLower())
                .OrderByDescending(otp => otp.CreatedAt)
                .FirstOrDefaultAsync();

            if (latestOtp == null)
            {
                throw new InvalidOperationException("No OTP found for this email");
            }
            if (latestOtp.Code != resetPassword.Otp)
            {
                throw new InvalidOperationException("OTP is incorrect");
            }
            if (latestOtp.ExpirationTime < DateTime.UtcNow)
            {
                throw new InvalidOperationException("OTP has expired");
            }

            var user = await GetUserByUsernameAsync(resetPassword.Email);
            if (user == null)
            {
                throw new InvalidOperationException("User does not exist");
            }

            // Ensure entity is tracked by DbContext
            if (_dbContext.Entry(user).State == EntityState.Detached)
            {
                _dbContext.Accounts.Attach(user);
            }

            // Update password
            user.PasswordHash = HashPassword(resetPassword.NewPassword);
            user.UpdatedAt = DateTime.UtcNow;

            // Mark entity as modified to ensure changes are saved
            _dbContext.Entry(user).State = EntityState.Modified;

            // Save changes to database
            var rowsAffected = await _dbContext.SaveChangesAsync();
            
            if (rowsAffected == 0)
            {
                throw new InvalidOperationException("Failed to save password changes to database");
            }
        }

        public async Task<List<Account>> GetAllUsersAsync()
        {
            return await _dbContext.Accounts
                .Include(a => a.Role) // vẫn include để lấy Role.Name
                .OrderByDescending(a => a.CreatedAt)
                .Select(a => new Account
                {
                    Id = a.Id,
                    Name = a.Name,
                    Email = a.Email,
                    Avatar = a.Avatar,
                    Phone = a.Phone,
                    Dob = a.Dob,
                    Gender = a.Gender,
                    Address = a.Address,
                    RoleId = a.RoleId,
                    //RoleName = a.Role.Name,                    // lấy tên role luôn
                    IsActive = a.IsActive ?? false,
                    IsBanned = a.IsBanned,
                    CreatedAt = a.CreatedAt ?? DateTime.MinValue,
                    UpdatedAt = a.UpdatedAt ?? DateTime.MinValue
                })
                .ToListAsync();
        }

        public async Task<Account> UpdateUserByAdminAsync(UpdateUserAdminDto dto)
        {
            if (dto == null)
            {
                throw new ArgumentNullException(nameof(dto));
            }

            var account = await _dbContext.Accounts
                .Include(a => a.Role)
                .FirstOrDefaultAsync(a => a.Id == dto.AccountId);

            if (account == null)
            {
                throw new InvalidOperationException($"Account not found with ID: {dto.AccountId}");
            }

            // Update Name
            if (!string.IsNullOrWhiteSpace(dto.Name))
            {
                account.Name = dto.Name.Trim();
            }

            // Update Avatar
            if (dto.Avatar != null)
            {
                account.Avatar = string.IsNullOrWhiteSpace(dto.Avatar) ? null : dto.Avatar.Trim();
            }

            // Update Phone
            if (dto.Phone != null)
            {
                account.Phone = string.IsNullOrWhiteSpace(dto.Phone) ? null : dto.Phone.Trim();
            }

            // Update DOB
            if (dto.DOB.HasValue)
            {
                account.Dob = dto.DOB.Value;
            }

            // Update Gender
            if (dto.Gender != null)
            {
                account.Gender = string.IsNullOrWhiteSpace(dto.Gender) ? null : dto.Gender.Trim();
            }

            // Update Address
            if (dto.Address != null)
            {
                account.Address = string.IsNullOrWhiteSpace(dto.Address) ? null : dto.Address.Trim();
            }

            // Update RoleId
            if (dto.RoleId.HasValue)
            {
                var role = await _dbContext.Roles.FirstOrDefaultAsync(r => r.Id == dto.RoleId.Value);
                if (role == null)
                {
                    throw new InvalidOperationException($"Role với ID {dto.RoleId.Value} không tồn tại trong hệ thống");
                }
                account.RoleId = dto.RoleId.Value;
            }

            // Update IsBanned
            if (dto.IsBanned.HasValue)
            {
                account.IsBanned = dto.IsBanned.Value;
                // Nếu bị ban thì set IsActive = false
                if (dto.IsBanned.Value)
                {
                    account.IsActive = false;
                }
            }

            account.UpdatedAt = DateTime.UtcNow;

            try
            {
                await _dbContext.SaveChangesAsync();
                return account;
            }
            catch (DbUpdateException exception)
            {
                throw new Exception($"Error updating account: {exception.InnerException?.Message ?? exception.Message}", exception);
            }
        }

        public async Task<Account> UpdateProfileAsync(int userId, UpdateProfileDto updateDto)
        {
            if (updateDto == null)
            {
                throw new ArgumentNullException(nameof(updateDto));
            }

            var user = await _dbContext.Accounts
                .FirstOrDefaultAsync(account => account.Id == userId);

            if (user == null)
            {
                throw new InvalidOperationException("User not found");
            }

            // Validate and update fields
            if (!string.IsNullOrEmpty(updateDto.Name))
            {
                user.Name = updateDto.Name.Trim();
            }

            if (!string.IsNullOrEmpty(updateDto.Phone))
            {
                user.Phone = updateDto.Phone.Trim();
            }

            if (!string.IsNullOrEmpty(updateDto.Avatar))
            {
                user.Avatar = updateDto.Avatar;
            }

            if (!string.IsNullOrEmpty(updateDto.Gender))
            {
                user.Gender = updateDto.Gender.Trim();
            }

            if (!string.IsNullOrEmpty(updateDto.Address))
            {
                user.Address = updateDto.Address.Trim();
            }

            // Handle DateTime for DOB 
            if (!string.IsNullOrEmpty(updateDto.DOB))
            {
                DateTime dateOfBirth;
                bool parseSuccess = false;

                // Thử parse với định dạng ISO (yyyy-MM-dd) trước - phổ biến nhất
                if (DateTime.TryParseExact(updateDto.DOB, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out dateOfBirth))
                {
                    parseSuccess = true;
                }
                // Thử các định dạng khác
                else if (DateTime.TryParseExact(updateDto.DOB, new[]
                {
            "dd/MM/yyyy", "MM/dd/yyyy", "dd-MM-yyyy", "MM-dd-yyyy",
            "yyyy/MM/dd", "dd MMM yyyy", "dd MMMM yyyy"
        }, CultureInfo.InvariantCulture, DateTimeStyles.None, out dateOfBirth))
                {
                    parseSuccess = true;
                }
                // Thử parse với culture hiện tại
                else if (DateTime.TryParse(updateDto.DOB, CultureInfo.CurrentCulture, DateTimeStyles.None, out dateOfBirth))
                {
                    parseSuccess = true;
                }

                if (parseSuccess)
                {
                    // Kiểm tra ngày hợp lệ (không trong tương lai)
                    if (dateOfBirth > DateTime.Now)
                    {
                        throw new ArgumentException("Date of Birth cannot be in the future.");
                    }

                    user.Dob = dateOfBirth;
                }
                else
                {
                    throw new ArgumentException(
                        $"Invalid date format for Date of Birth: '{updateDto.DOB}'. " +
                        "Please use one of these formats: yyyy-MM-dd, dd/MM/yyyy, MM/dd/yyyy, dd-MM-yyyy"
                    );
                }
            }
            else
            {
                // Nếu DOB là null hoặc empty, set thành null
                user.Dob = null;
            }

            user.UpdatedAt = DateTime.UtcNow;

            try
            {
                await _dbContext.SaveChangesAsync();
                return user;
            }
            catch (DbUpdateException exception)
            {
                throw new Exception($"Error updating profile: {exception.InnerException?.Message ?? exception.Message}", exception);
            }
        }

        public async Task<UserProfileDto> GetProfileAsync(int userId)
        {
            var user = await _dbContext.Accounts
                .Include(account => account.Role)
                .FirstOrDefaultAsync(account => account.Id == userId);

            if (user == null)
            {
                throw new InvalidOperationException("User not found");
            }

            return new UserProfileDto
            {
                Id = user.Id,
                Email = user.Email,
                Name = user.Name,
                Avatar = user.Avatar,
                Phone = user.Phone,
                Dob = user.Dob,
                Gender = user.Gender,
                Address = user.Address,
                RoleId = user.RoleId,
                RoleName = user.Role?.Name ?? string.Empty,
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.UpdatedAt
            };
        }

        public async Task BanAccount(string accountId, string reason)
        {
            if (!int.TryParse(accountId, out int id))
            {
                throw new ArgumentException($"Invalid account ID: {accountId}");
            }

            var account = await GetAccountByIdAsync(id);

            if (account.IsActive == false || account.IsBanned)
            {
                throw new InvalidOperationException("Account is already banned");
            }

            account.IsActive = false;
            account.IsBanned = true;
            account.UpdatedAt = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();

            await SendUserEmailAsync(account, "BanAccount.html",
                "NOTIFICATION: Your account has been BANNED", reason);

            await SendWebNotificationAsync(account, "Ban", "Account",
                accountId, $"Your account has been banned. Reason: {reason}");
        }

        public async Task UnbanAccount(string accountId)
        {
            if (!int.TryParse(accountId, out int id))
            {
                throw new ArgumentException($"Invalid account ID: {accountId}");
            }

            var account = await GetAccountByIdAsync(id);

            if (account.IsActive == true && !account.IsBanned)
            {
                throw new InvalidOperationException("Account is not banned");
            }

            account.IsActive = true;
            account.IsBanned = false;
            account.UpdatedAt = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();

            await SendUserEmailAsync(account, "UnbanAccount.html",
                "NOTIFICATION: Your account has been RESTORED");

            await SendWebNotificationAsync(account, "Unban", "Account",
                accountId, "Your account has been unbanned");
        }

        public async Task DeleteAccount(string accountId)
        {
            if (!int.TryParse(accountId, out int id))
            {
                throw new ArgumentException($"Invalid account ID: {accountId}");
            }

            var account = await GetAccountByIdAsync(id);

            // Check if account is Admin - prevent deleting admin accounts
            if (account.RoleId == 1) // Assuming 1 is Admin role ID
            {
                throw new InvalidOperationException("Cannot delete admin account");
            }

            // Delete all related records first
            // Delete AgencieCertificates
            var agencieCertificates = await _dbContext.AgencieCertificates
                .Where(ac => ac.AccountId == id)
                .ToListAsync();
            if (agencieCertificates.Any())
            {
                _dbContext.AgencieCertificates.RemoveRange(agencieCertificates);
            }

            // Delete HostCertificates
            var hostCertificates = await _dbContext.HostCertificates
                .Where(hc => hc.HostId == id)
                .ToListAsync();
            if (hostCertificates.Any())
            {
                _dbContext.HostCertificates.RemoveRange(hostCertificates);
            }

            // Delete Bookings (and related BookingCoupons)
            var bookings = await _dbContext.Bookings
                .Where(b => b.UserId == id)
                .ToListAsync();
            if (bookings.Any())
            {
                var bookingIds = bookings.Select(b => b.Id).ToList();
                var bookingCoupons = await _dbContext.BookingCoupons
                    .Where(bc => bookingIds.Contains(bc.BookingId))
                    .ToListAsync();
                if (bookingCoupons.Any())
                {
                    _dbContext.BookingCoupons.RemoveRange(bookingCoupons);
                }
                _dbContext.Bookings.RemoveRange(bookings);
            }

            // Delete Payments related to bookings
            if (bookings.Any())
            {
                var bookingIds = bookings.Select(b => b.Id).ToList();
                var payments = await _dbContext.Payments
                    .Where(p => bookingIds.Contains(p.BookingId))
                    .ToListAsync();
                if (payments.Any())
                {
                    _dbContext.Payments.RemoveRange(payments);
                }
            }

            // Delete Commentreactions (reactions by user)
            var commentReactions = await _dbContext.Commentreactions
                .Where(cr => cr.UserId == id)
                .ToListAsync();
            if (commentReactions.Any())
            {
                _dbContext.Commentreactions.RemoveRange(commentReactions);
            }

            // Delete Comments by user (and reactions to these comments)
            var comments = await _dbContext.Comments
                .Where(c => c.AuthorId == id)
                .ToListAsync();
            if (comments.Any())
            {
                // Delete reactions to these comments first
                var commentIds = comments.Select(c => c.Id).ToList();
                var reactionsToComments = await _dbContext.Commentreactions
                    .Where(cr => commentIds.Contains(cr.CommentId))
                    .ToListAsync();
                if (reactionsToComments.Any())
                {
                    _dbContext.Commentreactions.RemoveRange(reactionsToComments);
                }
                _dbContext.Comments.RemoveRange(comments);
            }

            // Delete Coupons
            var coupons = await _dbContext.Coupons
                .Where(c => c.HostId == id)
                .ToListAsync();
            if (coupons.Any())
            {
                _dbContext.Coupons.RemoveRange(coupons);
            }

            // Delete Messages (both sent and received)
            var messages = await _dbContext.Messages
                .Where(m => m.SenderId == id || m.ReceiverId == id)
                .ToListAsync();
            if (messages.Any())
            {
                _dbContext.Messages.RemoveRange(messages);
            }

            // Delete News
            var news = await _dbContext.News
                .Where(n => n.AccountId == id)
                .ToListAsync();
            if (news.Any())
            {
                _dbContext.News.RemoveRange(news);
            }

            // Delete Notifications
            var notifications = await _dbContext.Notifications
                .Where(n => n.UserId == id)
                .ToListAsync();
            if (notifications.Any())
            {
                _dbContext.Notifications.RemoveRange(notifications);
            }

            // Delete Otps
            var otps = await _dbContext.Otps
                .Where(o => o.UserId == id)
                .ToListAsync();
            if (otps.Any())
            {
                _dbContext.Otps.RemoveRange(otps);
            }

            // Delete Postreactions
            var postReactions = await _dbContext.Postreactions
                .Where(pr => pr.UserId == id)
                .ToListAsync();
            if (postReactions.Any())
            {
                _dbContext.Postreactions.RemoveRange(postReactions);
            }

            // Delete Posts (and related reactions, comments, saves)
            var posts = await _dbContext.Posts
                .Where(p => p.AuthorId == id)
                .ToListAsync();
            if (posts.Any())
            {
                var postIds = posts.Select(p => p.Id).ToList();
                
                // Delete reactions to these posts
                var reactionsToPosts = await _dbContext.Postreactions
                    .Where(pr => postIds.Contains(pr.PostId))
                    .ToListAsync();
                if (reactionsToPosts.Any())
                {
                    _dbContext.Postreactions.RemoveRange(reactionsToPosts);
                }

                // Delete saves of these posts
                var savesOfPosts = await _dbContext.Postsaves
                    .Where(ps => postIds.Contains(ps.PostId))
                    .ToListAsync();
                if (savesOfPosts.Any())
                {
                    _dbContext.Postsaves.RemoveRange(savesOfPosts);
                }

                // Delete comments on these posts (all comments, not just user's comments)
                // Note: User's own comments were already deleted above
                var commentsOnPosts = await _dbContext.Comments
                    .Where(c => postIds.Contains(c.PostId))
                    .ToListAsync();
                if (commentsOnPosts.Any())
                {
                    var commentIds = commentsOnPosts.Select(c => c.Id).ToList();
                    // Delete reactions to these comments
                    var reactionsToPostComments = await _dbContext.Commentreactions
                        .Where(cr => commentIds.Contains(cr.CommentId))
                        .ToListAsync();
                    if (reactionsToPostComments.Any())
                    {
                        _dbContext.Commentreactions.RemoveRange(reactionsToPostComments);
                    }
                    _dbContext.Comments.RemoveRange(commentsOnPosts);
                }

                _dbContext.Posts.RemoveRange(posts);
            }

            // Delete Postsaves
            var postSaves = await _dbContext.Postsaves
                .Where(ps => ps.AccountId == id)
                .ToListAsync();
            if (postSaves.Any())
            {
                _dbContext.Postsaves.RemoveRange(postSaves);
            }

            // Delete Reactions
            var reactions = await _dbContext.Reactions
                .Where(r => r.UserId == id)
                .ToListAsync();
            if (reactions.Any())
            {
                _dbContext.Reactions.RemoveRange(reactions);
            }

            // Delete RequestSupports (and related SupportResponses)
            var requestSupports = await _dbContext.RequestSupports
                .Where(rs => rs.UserId == id)
                .ToListAsync();
            if (requestSupports.Any())
            {
                var supportIds = requestSupports.Select(rs => rs.Id).ToList();
                var supportResponses = await _dbContext.SupportResponses
                    .Where(sr => supportIds.Contains(sr.SupportId))
                    .ToListAsync();
                if (supportResponses.Any())
                {
                    _dbContext.SupportResponses.RemoveRange(supportResponses);
                }
                _dbContext.RequestSupports.RemoveRange(requestSupports);
            }

            // Delete SupportResponses where user is responder
            var supportResponsesAsResponder = await _dbContext.SupportResponses
                .Where(sr => sr.ResponderId == id)
                .ToListAsync();
            if (supportResponsesAsResponder.Any())
            {
                _dbContext.SupportResponses.RemoveRange(supportResponsesAsResponder);
            }

            // Delete Reviews
            var reviews = await _dbContext.Reviews
                .Where(r => r.AuthorId == id)
                .ToListAsync();
            if (reviews.Any())
            {
                _dbContext.Reviews.RemoveRange(reviews);
            }

            // Delete Servicecombos (and related ServicecomboDetails)
            var serviceCombos = await _dbContext.Servicecombos
                .Where(sc => sc.HostId == id)
                .ToListAsync();
            if (serviceCombos.Any())
            {
                var comboIds = serviceCombos.Select(sc => sc.Id).ToList();
                var comboDetails = await _dbContext.ServicecomboDetails
                    .Where(sd => comboIds.Contains(sd.ServicecomboId))
                    .ToListAsync();
                if (comboDetails.Any())
                {
                    _dbContext.ServicecomboDetails.RemoveRange(comboDetails);
                }
                _dbContext.Servicecombos.RemoveRange(serviceCombos);
            }

            // Delete Services
            var services = await _dbContext.Services
                .Where(s => s.HostId == id)
                .ToListAsync();
            if (services.Any())
            {
                _dbContext.Services.RemoveRange(services);
            }

            // Save all deletions
            await _dbContext.SaveChangesAsync();

            // Finally, delete the account
            _dbContext.Accounts.Remove(account);
            await _dbContext.SaveChangesAsync();
        }

        public async Task<Account> GetAccountById(int accountId)
        {
            return await GetAccountByIdAsync(accountId);
        }

        public async Task<Account> GetAccountByIdAsync(int accountId)
        {
            var account = await _dbContext.Accounts
                .Include(account => account.Role)
                .FirstOrDefaultAsync(account => account.Id == accountId);

            if (account == null)
            {
                throw new InvalidOperationException($"Account not found with ID: {accountId}");
            }

            return account;
        }
        #endregion

        #region OTP Management
        public async Task RequestOtp(RequestOtpDto requestOtpDto)
        {
            if (requestOtpDto == null || string.IsNullOrWhiteSpace(requestOtpDto.Email))
            {
                throw new ArgumentException("Email cannot be null or empty");
            }

            var otp = new Otp
            {
                Email = requestOtpDto.Email.Trim(),
                Code = OTPGenerator.GenerateOTP(),
                ExpirationTime = DateTime.UtcNow.AddMinutes(5),
                IsVerified = false,
                CreatedAt = DateTime.UtcNow
            };

            await _otpRepository.AddAsync(otp);

            string subject = "OTP Verification Code";
            string content = $"Your OTP verification code for account registration is: {otp.Code}";
            await _emailHelper.SendEmailAsync(subject, content, new List<string> { otp.Email });
        }

        public async Task RequestOtpForgetPassword(RequestOtpDto requestOtpDto)
        {
            if (requestOtpDto == null || string.IsNullOrWhiteSpace(requestOtpDto.Email))
            {
                throw new ArgumentException("Email cannot be null or empty");
            }

            var user = await GetUserByUsernameAsync(requestOtpDto.Email);
            if (user == null)
            {
                throw new InvalidOperationException("Email does not exist in the system");
            }

            var otpCode = new Otp
            {
                UserId = user.Id,
                Email = requestOtpDto.Email.Trim().ToLower(),
                Code = OTPGenerator.GenerateOTP(),
                ExpirationTime = DateTime.UtcNow.AddMinutes(5),
                IsVerified = false,
                CreatedAt = DateTime.UtcNow
            };

            _dbContext.Otps.Add(otpCode);
            await _dbContext.SaveChangesAsync();

            try
            {
                string subject = "Password Reset OTP";
                string content = $"Your password reset OTP code is: {otpCode.Code}";
                await _emailHelper.SendEmailAsync(subject, content, new List<string> { requestOtpDto.Email });
                Console.WriteLine($"OTP code {otpCode.Code} has been sent to {requestOtpDto.Email}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error sending email to {requestOtpDto.Email}: {ex.Message}");
                throw new InvalidOperationException($"Failed to send OTP email. Please try again later. Error: {ex.Message}", ex);
            }
        }

        public async Task<bool> VerifyOtp(VerifyOtpDto verifyOtpDto)
        {
            if (verifyOtpDto == null)
            {
                throw new ArgumentNullException(nameof(verifyOtpDto));
            }

            var latestOtp = await _dbContext.Otps
                .Where(otp => otp.Email != null && otp.Email.ToLower() == verifyOtpDto.Email.ToLower())
                .OrderByDescending(otp => otp.CreatedAt)
                .FirstOrDefaultAsync();

            // Fallback: nếu OTP quên mật khẩu trước đây không lưu Email, tìm theo UserId
            if (latestOtp == null)
            {
                var user = await GetUserByUsernameAsync(verifyOtpDto.Email);
                if (user != null)
                {
                    latestOtp = await _dbContext.Otps
                        .Where(otp => otp.UserId == user.Id)
                        .OrderByDescending(otp => otp.CreatedAt)
                        .FirstOrDefaultAsync();
                }
            }

            if (latestOtp == null)
            {
                throw new InvalidOperationException("No OTP found for this email");
            }
            if (latestOtp.Code != verifyOtpDto.Otp)
            {
                throw new InvalidOperationException("OTP is incorrect");
            }
            if (latestOtp.ExpirationTime < DateTime.UtcNow)
            {
                throw new InvalidOperationException("OTP has expired");
            }

            latestOtp.IsVerified = true;
            await _dbContext.SaveChangesAsync();

            return true;
        }
        #endregion

        #region Certificate Management
        public async Task<List<AgencyCertificateResponseDto>> GetAllAgencyCertificatesAsync(string status = null)
        {
            var query = _dbContext.AgencieCertificates
                .Include(agencyCertificate => agencyCertificate.Account)
                .AsQueryable();

            if (!string.IsNullOrEmpty(status) && status != "All")
            {
                query = query.Where(agencyCertificate => agencyCertificate.Status == status);
            }

            var certificates = await query
                .OrderByDescending(agencyCertificate => agencyCertificate.CreatedAt)
                .ToListAsync();

            return certificates.Select<AgencieCertificate, AgencyCertificateResponseDto>(MapAgencyCertificate).ToList();
        }

        public async Task<List<HostCertificateResponseDto>> GetAllHostCertificatesAsync(string status = null)
        {
            var query = _dbContext.HostCertificates
                .Include(hostCertificate => hostCertificate.Host)
                .AsQueryable();

            if (!string.IsNullOrEmpty(status) && status != "All")
            {
                query = query.Where(hostCertificate => hostCertificate.Status == status);
            }

            var certificates = await query
                .OrderByDescending(hostCertificate => hostCertificate.CreatedAt)
                .ToListAsync();

            return certificates.Select<Models.HostCertificate, HostCertificateResponseDto>(MapHostCertificate).ToList();
        }

        public async Task<AgencyCertificateResponseDto?> GetMyAgencyCertificateAsync(int userId)
        {
            var certificate = await _dbContext.AgencieCertificates
                .Include(c => c.Account)
                .Where(c => c.AccountId == userId)
                .OrderByDescending(c => c.CreatedAt)
                .FirstOrDefaultAsync();

            return certificate == null ? null : MapAgencyCertificate(certificate);
        }

        public async Task<HostCertificateResponseDto?> GetMyHostCertificateAsync(int userId)
        {
            var certificate = await _dbContext.HostCertificates
                .Include(c => c.Host)
                .Where(c => c.HostId == userId)
                .OrderByDescending(c => c.CreatedAt)
                .FirstOrDefaultAsync();

            return certificate == null ? null : MapHostCertificate(certificate);
        }

        public async Task RequestUpgradeToAgencyAsync(int userId, RequestAgencyUpgradeDto requestDto)
        {
            if (requestDto == null)
            {
                throw new ArgumentNullException(nameof(requestDto));
            }

            var user = await _dbContext.Accounts.FirstOrDefaultAsync(account => account.Id == userId);
            if (user == null)
            {
                throw new InvalidOperationException("User does not exist");
            }

            var agencyCertificate = new Models.AgencieCertificate
            {
                AccountId = userId,
                Status = "Pending",
                Companyname = requestDto.CompanyName,
                LicenseFile = requestDto.LicenseFile,
                Phone = requestDto.Phone,
                Email = requestDto.Email,
                Website = requestDto.Website,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _dbContext.AgencieCertificates.Add(agencyCertificate);
            await _dbContext.SaveChangesAsync();

            await SendWebNotificationAsync(user, "Pending", "Agency Certificate", agencyCertificate.AgencyId.ToString(),
                $"User {user.Name} has submitted an upgrade request to Agency.");
        }

        public async Task RequestUpgradeToHostAsync(int userId, RequestHostUpgradeDto requestDto)
        {
            if (requestDto == null)
            {
                throw new ArgumentNullException(nameof(requestDto));
            }

            var user = await _dbContext.Accounts.FirstOrDefaultAsync(account => account.Id == userId);
            if (user == null)
            {
                throw new InvalidOperationException("User does not exist");
            }

            var hostCertificate = new Models.HostCertificate
            {
                HostId = userId,
                Status = "Pending",
                BusinessLicenseFile = requestDto.BusinessLicenseFile,
                Phone = requestDto.Phone,
                Email = requestDto.Email,
                BusinessName = requestDto.BusinessName,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _dbContext.HostCertificates.Add(hostCertificate);
            await _dbContext.SaveChangesAsync();

            await SendWebNotificationAsync(user, "Pending", "Host Certificate", hostCertificate.CertificateId.ToString(),
                $"User {user.Name} has submitted an upgrade request to Host.");
        }

        public async Task ApproveUpgradeCertificateAsync(ApproveCertificateDto dto)
        {
            var (certificate, user, newRoleId, objectType) = await GetCertificateAndUserForProcessing(dto.CertificateId, dto.Type);

            certificate.Status = "Approved";
            certificate.UpdatedAt = DateTime.UtcNow;

            user.RoleId = newRoleId;
            user.UpdatedAt = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();

            await SendUserEmailAsync(user, "ApproveCertificate.html",
                "NOTIFICATION: Role upgrade request has been APPROVED");

            await SendWebNotificationAsync(user, "Approved", objectType,
                dto.CertificateId.ToString(),
                $"Your {objectType} upgrade request has been approved successfully.");
        }

        public async Task RejectUpgradeCertificateAsync(RejectCertificateDto dto)
        {
            var (certificate, user, _, objectType) = await GetCertificateAndUserForProcessing(dto.CertificateId, dto.Type);

            certificate.Status = "Rejected";
            certificate.RejectComment = dto.Comment;
            certificate.UpdatedAt = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();

            await SendUserEmailAsync(user, "RejectCertificate.html",
                "NOTIFICATION: Role upgrade request has been REJECTED", dto.Comment);

            await SendWebNotificationAsync(user, "Rejected", objectType,
                dto.CertificateId.ToString(),
                $"Your {objectType} upgrade request has been rejected. Reason: {dto.Comment}");
        }

        public async Task ReviewUpgradeCertificateAsync(ReviewCertificateDto dto)
        {
            var (certificate, user, _, objectType) = await GetCertificateAndUserForProcessing(dto.CertificateId, dto.Type);

            certificate.Status = "Review";

            // Handle ReviewComments - add new comment to the list
            var reviewComments = new List<ReviewComment>();
            if (!string.IsNullOrEmpty(certificate.ReviewComments))
            {
                reviewComments = JsonSerializer.Deserialize<List<ReviewComment>>(certificate.ReviewComments) ?? new List<ReviewComment>();
            }

            reviewComments.Add(new ReviewComment
            {
                CreatedDate = DateTime.UtcNow,
                Content = dto.Comment
            });

            certificate.ReviewComments = JsonSerializer.Serialize(reviewComments);
            certificate.UpdatedAt = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();

            await SendUserEmailAsync(user, "AddCertificateReviewComment.html",
                "NOTIFICATION: Additional information required for Role upgrade", dto.Comment);

            await SendWebNotificationAsync(user, "Review", objectType,
                dto.CertificateId.ToString(),
                $"Your {objectType} upgrade request requires additional information. Content: {dto.Comment}");
        }

        private async Task<(dynamic Certificate, Account User, int SuccessRoleId, string ObjectType)>
            GetCertificateAndUserForProcessing(int certificateId, CertificateType type)
        {
            dynamic certificate = null;
            Account user = null;
            int successRoleId = 0;
            string objectType = string.Empty;

            switch (type)
            {
                case CertificateType.Agency:
                    certificate = await _dbContext.AgencieCertificates
                        .Include(agencyCertificate => agencyCertificate.Account)
                        .FirstOrDefaultAsync(agencyCertificate => agencyCertificate.AgencyId == certificateId);
                    if (certificate != null)
                    {
                        user = certificate.Account;
                        successRoleId = 3; // Role ID for Agency
                        objectType = "Agency Certificate";
                    }
                    break;

                case CertificateType.Host:
                    certificate = await _dbContext.HostCertificates
                        .Include(hostCertificate => hostCertificate.Host)
                        .FirstOrDefaultAsync(hostCertificate => hostCertificate.CertificateId == certificateId);
                    if (certificate != null)
                    {
                        user = certificate.Host;
                        successRoleId = 2; // Role ID for Host
                        objectType = "Host Certificate";
                    }
                    break;

                default:
                    throw new ArgumentException("Invalid certificate type");
            }

            if (certificate == null)
            {
                throw new InvalidOperationException($"Certificate not found for ID: {certificateId}");
            }

            if (user == null)
            {
                throw new InvalidOperationException("User not found for this certificate");
            }

            return (certificate, user, successRoleId, objectType);
        }

        private AgencyCertificateResponseDto MapAgencyCertificate(AgencieCertificate agencyCertificate)
        {
            var reviewComments =
                JsonSerializer.Deserialize<List<DTOs.Users.AgencyCertificateReViewComment>>(agencyCertificate.ReviewComments)
                ?? new List<DTOs.Users.AgencyCertificateReViewComment>();

            return new AgencyCertificateResponseDto
            {
                AgencyId = agencyCertificate.AgencyId,
                AccountId = agencyCertificate.AccountId,
                CompanyName = agencyCertificate.Companyname,
                LicenseFile = agencyCertificate.LicenseFile,
                Phone = agencyCertificate.Phone,
                Email = agencyCertificate.Email,
                Website = agencyCertificate.Website,
                Status = agencyCertificate.Status,
                RejectComment = agencyCertificate.RejectComment,
                ReviewComments = reviewComments,
                CreatedAt = agencyCertificate.CreatedAt,
                UpdatedAt = agencyCertificate.UpdatedAt,
                UserName = agencyCertificate.Account?.Name ?? string.Empty,
                UserEmail = agencyCertificate.Account?.Email ?? string.Empty
            };
        }

        private HostCertificateResponseDto MapHostCertificate(Models.HostCertificate hostCertificate)
        {
            var reviewComments =
                JsonSerializer.Deserialize<List<DTOs.Certificates.HostCertificateReViewComment>>(hostCertificate.ReviewComments)
                ?? new List<DTOs.Certificates.HostCertificateReViewComment>();

            return new HostCertificateResponseDto
            {
                CertificateId = hostCertificate.CertificateId,
                HostId = hostCertificate.HostId,
                BusinessLicenseFile = hostCertificate.BusinessLicenseFile,
                BusinessName = hostCertificate.BusinessName,
                Phone = hostCertificate.Phone,
                Email = hostCertificate.Email,
                Status = hostCertificate.Status,
                RejectComment = hostCertificate.RejectComment,
                ReviewComments = reviewComments,
                CreatedAt = hostCertificate.CreatedAt,
                UpdatedAt = hostCertificate.UpdatedAt,
                HostName = hostCertificate.Host?.Name ?? string.Empty,
                HostEmail = hostCertificate.Host?.Email ?? string.Empty
            };
        }

        // Helper class for review comments
        private class ReviewComment
        {
            public DateTime CreatedDate { get; set; }
            public string Content { get; set; } = string.Empty;
        }
        #endregion

        public async Task<List<int>> GetAllAdminAndHostId()
        {
            // Giả định Role Admin có RoleId = 1 và Role Host có RoleId = 2
            // Nếu bạn có nhiều Role cần nhận thông báo, hãy thêm RoleId vào điều kiện Where
            var adminHostIds = await _dbContext.Accounts
                .Where(a => a.RoleId == 1 || a.RoleId == 2) // Lọc Admin (1) và Host (2)
                .Select(a => a.Id)
                .ToListAsync();

            return adminHostIds;
        }

        public async Task<List<int>> GetAllAdminAndAgencyId()
        {
            // Giả định Role Admin có RoleId = 1 và Role Host có RoleId = 2
            // Nếu bạn có nhiều Role cần nhận thông báo, hãy thêm RoleId vào điều kiện Where
            var adminHostIds = await _dbContext.Accounts
                .Where(a => a.RoleId == 1 || a.RoleId == 3) // Lọc Admin (1) và Host (2)
                .Select(a => a.Id)
                .ToListAsync();

            return adminHostIds;
        }

        public async Task<List<int>> GetAllAdminAndCustomerId()
        {
            // Giả định Role Admin có RoleId = 1 và Role Host có RoleId = 2
            // Nếu bạn có nhiều Role cần nhận thông báo, hãy thêm RoleId vào điều kiện Where
            var adminHostIds = await _dbContext.Accounts
                .Where(a => a.RoleId == 1 || a.RoleId == 4) // Lọc Admin (1) và Host (2)
                .Select(a => a.Id)
                .ToListAsync();

            return adminHostIds;
        }



        #region Helper Methods
        private static string HashPassword(string password)
        {
            if (string.IsNullOrWhiteSpace(password))
            {
                throw new ArgumentException("Password cannot be null or empty");
            }

            return BCrypt.Net.BCrypt.HashPassword(password);
        }

        public bool VerifyPassword(string enteredPassword, string storedHash)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(enteredPassword) || string.IsNullOrWhiteSpace(storedHash))
                {
                    return false;
                }

                // BCrypt.Verify có thể throw exception nếu hash không hợp lệ
                // Đảm bảo luôn return false trong trường hợp có lỗi
                return BCrypt.Net.BCrypt.Verify(enteredPassword, storedHash);
            }
            catch (Exception)
            {
                // Nếu có bất kỳ exception nào (hash không hợp lệ, format sai, etc.)
                // Luôn trả về false để từ chối đăng nhập
                return false;
            }
        }

        public async Task<GoogleJsonWebSignature.Payload> VerifyGoogleTokenAsync(string idToken)
        {
            if (string.IsNullOrWhiteSpace(idToken))
            {
                throw new ArgumentException("ID token cannot be null or empty");
            }

            try
            {
                var settings = new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = new List<string> { _jwtSetting.GoogleClientID }
                };
                return await GoogleJsonWebSignature.ValidateAsync(idToken, settings);
            }
            catch (InvalidJwtException exception)
            {
                throw new InvalidOperationException("Google token validation failed", exception);
            }
        }

        private async Task SendUserEmailAsync(Account user, string templateName, string subject, string comment = null)
        {
            try
            {
                string filePath = Path.Combine(_env.ContentRootPath, "EmailTemplates", templateName);
                if (!File.Exists(filePath))
                {
                    throw new FileNotFoundException($"Email template not found: {templateName}", filePath);
                }

                string htmlBody = await File.ReadAllTextAsync(filePath);
                string body = htmlBody
                    .Replace("{{UserName}}", user.Name)
                    .Replace("{{Hompage}}", _emailConfig.HomePage ?? "https://your-website.com")
                    .Replace("{{Comment}}", comment ?? "")
                    .Replace("{{Reason}}", comment ?? "");

                await _emailHelper.SendEmailAsync(subject, body, new List<string> { user.Email }, true);
            }
            catch (Exception exception)
            {
                // Log email error but don't break the main operation
                Console.WriteLine($"Email sending failed: {exception.Message}");
            }
        }

        private async Task SendWebNotificationAsync(Account user, string status, string objectType, string objectId, string content)
        {
            try
            {
                // Create notification for the user
                var userNotification = new Notification
                {
                    UserId = user.Id,
                    Message = content,
                    Title = $"Status update: {status}",
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                };

                _dbContext.Notifications.Add(userNotification);

                var adminNotifications = new List<Notification>();

                // Notify admins for certificate-related actions
                if (objectType.Contains("Certificate"))
                {
                    var adminContent = $"{objectType} request from {user.Name} has been updated to {status}.";
                    var admins = await _dbContext.Accounts
                        .Where(admin => admin.RoleId == 1) // Role 1 = Admin
                        .ToListAsync();

                    foreach (var admin in admins)
                    {
                        adminNotifications.Add(new Notification
                        {
                            UserId = admin.Id,
                            Message = adminContent,
                            Title = $"System update: {status}",
                            IsRead = false,
                            CreatedAt = DateTime.UtcNow
                        });
                    }
                }

                if (adminNotifications.Any())
                {
                    _dbContext.Notifications.AddRange(adminNotifications);
                }

                await _dbContext.SaveChangesAsync();

                // Send signalR message to user
                var userNotificationDto = new NotificationDto
                {
                    Id = userNotification.Id,
                    UserId = userNotification.UserId,
                    Message = userNotification.Message,
                    Title = userNotification.Title,
                    IsRead = userNotification.IsRead,
                    CreatedAt = userNotification.CreatedAt
                };

                await _hubNotificationContext.Clients.User(user.Id.ToString())
                    .SendAsync("ReceiveNotification", userNotificationDto);

                // Send signalR message to each admin
                foreach (var adminNotification in adminNotifications)
                {
                    try
                    {
                        var adminNotificationDto = new NotificationDto
                        {
                            Id = adminNotification.Id,
                            UserId = adminNotification.UserId,
                            Message = adminNotification.Message,
                            Title = adminNotification.Title,
                            IsRead = adminNotification.IsRead,
                            CreatedAt = adminNotification.CreatedAt
                        };

                        await _hubNotificationContext.Clients.User(adminNotification.UserId.ToString())
                            .SendAsync("ReceiveNotification", adminNotificationDto);
                    }
                    catch (Exception exception)
                    {
                        Console.WriteLine($"Failed to send notification to admin {adminNotification.UserId}: {exception.Message}");
                    }
                }
            }
            catch (Exception exception)
            {
                // Log notification error but don't break the main operation
                Console.WriteLine($"Notification sending failed: {exception.Message}");
            }
        }
        #endregion
    }
}