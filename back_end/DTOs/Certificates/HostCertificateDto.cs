namespace ESCE_SYSTEM.DTOs.Certificates
{
    public class HostCertificate
    {
        public required string BusinessLicenseFile { get; set; }
        public required string BusinessName { get; set; }
        public required string Phone { get; set; }
        public required string Email { get; set; }
        public required string Image { get; set; }
        public required string RejectComment { get; set; }
        public required List<HostCertificateReViewComment> ReviewComments { get; set; }
    }
    public class HostCertificateReViewComment
    {
        public DateTime CreatedDate { get; set; }
        public required string Content { get; set; }
    }
}

