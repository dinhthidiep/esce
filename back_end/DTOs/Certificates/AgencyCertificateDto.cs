namespace ESCE_SYSTEM.DTOs.Users
{
    public class AgencyCertificate
    {
        public required string CompanyName { get; set; }
        public required string LicenseFile { get; set; }  // URL/Path tới file Giấy phép
        public required string Phone { get; set; }
        public required string Email { get; set; }
        public string? Website { get; set; }
        public required string Image { get; set; }
        public required string RejectComment { get; set; }
        public required List<AgencyCertificateReViewComment> ReviewComments { get; set; }
    }
    public class AgencyCertificateReViewComment
    {
        public DateTime CreatedDate { get; set; }
        public required string Content { get; set; }
    }
}