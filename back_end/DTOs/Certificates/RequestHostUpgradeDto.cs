namespace ESCE_SYSTEM.DTOs.Certificates
{
    public class RequestHostUpgradeDto
    {
        public required string BusinessLicenseFile { get; set; }
        public required string BusinessName { get; set; }
        public required string Phone { get; set; }
        public required string Email { get; set; }
        public required string RejectComment { get; set; } 
    }
}

