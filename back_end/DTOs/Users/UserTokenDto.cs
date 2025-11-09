namespace ESCE_SYSTEM.DTOs.Users
{
    public class UserTokenDto
    {
        public required string Id { get; set; }
        public required string UserEmail { get; set; }
        public required string Role { get; set; }
    }
}
