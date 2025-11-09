namespace ESCE_SYSTEM.DTOs.Users
{
    public class RegisterUserDto
    {
        public required string UserEmail { get; set; }
        public required string Password { get; set; }
        public required string FullName { get; set; }
        public required string Phone { get; set; }
        public int RoleId { get; set; }

    }
}
