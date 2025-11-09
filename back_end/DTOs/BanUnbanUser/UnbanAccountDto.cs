namespace ESCE_SYSTEM.DTOs.BanUnbanUser
{
    public class UnbanAccountDto
    {
        public required string AccountId { get; set; }
        public required string Reason { get; set; }
    }
}
