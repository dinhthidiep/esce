using ESCE_SYSTEM.DTOs.Users;
using ESCE_SYSTEM.Models;
using Google.Apis.Auth;

namespace ESCE_SYSTEM.Services.UserService
{
    public interface IUserService
    {
        Task<Account> GetUserByUsernameAsync(string userEmail);
        Task CreateUserAsync(RegisterUserDto account, bool verifyOtp, bool isGoogleAccount);
        bool VerifyPassword(string enteredPassword, string storedHash);
        Task RequestOtp(RequestOtpDto requestOtpDto);
        Task<bool> VerifyOtp(VerifyOtpDto verifyOtpDto);
        Task ChangePassword(ChangePasswordDto changePassword);
        Task RequestOtpForgetPassword(RequestOtpDto requestOtpDto);
        Task ResetPassword(ResetPasswordDto resetPassword);
        Task<GoogleJsonWebSignature.Payload> VerifyGoogleTokenAsync(string idToken);
    }
}