namespace ESCE_SYSTEM.DTOs.Certificates
{
    public class HostCertificateResponseDto
    {
        public int CertificateId { get; set; }
        public int HostId { get; set; }
        public required string BusinessLicenseFile { get; set; }
        public required string BusinessName { get; set; }
        public required string Phone { get; set; }
        public required string Email { get; set; }
        public string? Status { get; set; }
        public required string RejectComment { get; set; }
        // Sử dụng ReviewComment DTO đã được định nghĩa
        public List<HostCertificateReViewComment> ReviewComments { get; set; } = new List<HostCertificateReViewComment>();
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public required string HostName { get; set; }
        public required string HostEmail { get; set; }
    }
}