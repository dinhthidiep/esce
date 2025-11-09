namespace ESCE_SYSTEM.DTOs.Certificates
{
    public class RequestAgencyUpgradeDto
    {
        public required string CompanyName { get; set; } 
        public required string LicenseFile { get; set; }  // URL/Path tới file Giấy phép
        public required string Phone { get; set; } 
        public required string Email { get; set; } 
        public string? Website { get; set; }
       
    }
}