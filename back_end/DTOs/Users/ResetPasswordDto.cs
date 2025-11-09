namespace ESCE_SYSTEM.DTOs.Users
{
    public class ResetPasswordDto
    {
        public required string Email { get; set; }
        public required string NewPassword { get; set; }
        public required string Otp { get; set; }
    }
}
