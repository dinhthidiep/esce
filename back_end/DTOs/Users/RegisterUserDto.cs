namespace ESCE_SYSTEM.DTOs.Users
{
    public class RegisterUserDto
    {
        public string UserEmail { get; set; }
        public string Password { get; set; }
        public string FullName { get; set; }
        public string Phone { get; set; }
        public int RoleId { get; set; }

    }
}
