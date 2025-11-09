namespace ESCE_SYSTEM.DTOs.Users
{
    public class LoginResponseDto
    {
        public required string Token { get; set; }
        public required object UserInfo { get; set; }
    }
}
