using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESCE_SYSTEM.Models
{
    [Table("SERVICE")]
    public class Service
    {
        [Column("ID")]
        public int Id { get; set; }
        [Column("NAME")]
        public string? Name { get; set; }
        [Column("DESCRIPTION")]
        public string? Description { get; set; }
        [Column("PRICE", TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }
        [NotMapped]
        public string? Image { get; set; }
        [Column("CREATED_AT")]
        public DateTime Created_At { get; set; } = DateTime.Now;
        [Column("UPDATED_AT")]
        public DateTime Updated_At { get; set; }

        // Foreign Key to Account (Host who created this service)
        [Column("HOST_ID")]
        public int HostId { get; set; }

    }
}
