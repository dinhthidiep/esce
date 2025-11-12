using System.ComponentModel.DataAnnotations.Schema;

namespace ESCE_SYSTEM.Models
{
    public class Service
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }
        public DateTime Created_At { get; set; } = DateTime.Now;
        public DateTime Updated_At { get; set; }
        
        // Foreign Key to Account (Host who created this service)
        public int HostId { get; set; }

    }
}
