using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;

namespace ESCE_SYSTEM.Models
{
    [Table("SERVICECOMBO")]
    public class ServiceCombo
    {
        [Column("ID")]
        public int Id { get; set; }

        [Column("NAME")]
        [Required]
        [MaxLength(255)]
        public string Name { get; set; } = string.Empty;

        [Column("ADDRESS")]
        [Required]
        [MaxLength(255)]
        public string Address { get; set; } = string.Empty;

        [Column("DESCRIPTION")]
        [MaxLength(1000)]
        public string? Description { get; set; }

        [Column("PRICE", TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

        [Column("AVAILABLE_SLOTS")]
        public int AvailableSlots { get; set; }

        [Column("IMAGE", TypeName = "nvarchar(max)")]
        public string? Image { get; set; }

        [Column("STATUS")]
        [MaxLength(50)]
        public string Status { get; set; } = "open"; // open / closed / canceled

        [Column("CANCELLATION_POLICY")]
        [MaxLength(1000)]
        public string? CancellationPolicy { get; set; }

        [Column("CREATED_AT")]
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        [Column("UPDATED_AT")]
        public DateTime UpdatedAt { get; set; } = DateTime.Now;

        // Foreign Key to Account (Host who created this combo)
        [Column("HOST_ID")]
        public int HostId { get; set; }
        
        // Navigation properties - ignored during JSON serialization/deserialization and model validation
        [JsonIgnore]
        [ValidateNever]
        [ForeignKey("HostId")]
        public virtual Account Host { get; set; } = null!;
        
        [JsonIgnore]
        [ValidateNever]
        public virtual ICollection<ServiceComboDetail> ServiceComboDetails { get; set; } = new List<ServiceComboDetail>();
       // public virtual ICollection<Coupon> Coupons { get; set; } = new List<Coupon>();
       // public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    }
}