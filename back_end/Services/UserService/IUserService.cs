using ESCE_SYSTEM.DTOs.Certificates;
using ESCE_SYSTEM.DTOs.Users;
using ESCE_SYSTEM.Models;
using Google.Apis.Auth;

namespace ESCE_SYSTEM.Services.UserService
{
    public interface IUserService
    {
        Task<Account> GetUserByUsernameAsync(string userEmail);
        Task CreateUserAsync(RegisterUserDto account, bool verifyOtp, bool isGoogleAccount, int roleId = 4);
        bool VerifyPassword(string enteredPassword, string storedHash);
        Task RequestOtp(RequestOtpDto requestOtpDto);
        Task<bool> VerifyOtp(VerifyOtpDto verifyOtpDto);
        Task ChangePassword(ChangePasswordDto changePassword);
        Task RequestOtpForgetPassword(RequestOtpDto requestOtpDto);
        Task ResetPassword(ResetPasswordDto resetPassword);
        Task<GoogleJsonWebSignature.Payload> VerifyGoogleTokenAsync(string idToken);
        // Yêu cầu nâng cấp
        Task RequestUpgradeToAgencyAsync(int userId, RequestAgencyUpgradeDto requestDto);
        Task RequestUpgradeToHostAsync(int userId, RequestHostUpgradeDto requestDto);

        // Duyệt Role
        Task ApproveUpgradeCertificateAsync(ApproveCertificateDto dto);
        Task RejectUpgradeCertificateAsync(RejectCertificateDto dto);
        Task ReviewUpgradeCertificateAsync(ReviewCertificateDto dto);

        // Quản lý Account
        Task BanAccount(string accountId, string reason);
        Task UnbanAccount(string accountId);
        Task<Account> GetAccountById(int accountId);
    }
}