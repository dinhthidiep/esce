namespace ESCE_SYSTEM.DTOs.Users
{
    public class LoginGoogleDto
    {
        public required string IdToken { get; set; }
        public int? RoleId { get; set; }
        public string? PhoneNumber { get; set; }
    }
}