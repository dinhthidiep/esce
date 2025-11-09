namespace ESCE_SYSTEM.DTOs.Users
{
    public class RequestOtpDto
    {
        public required string Email { get; set; }
        public required string PhoneNumber { get; set; }
    }
}
