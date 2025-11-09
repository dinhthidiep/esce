using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;

namespace ESCE_SYSTEM.Models
{
    [Table("COUPONS")]
    public class Coupon
    {
        [Column("ID")]
        public int Id { get; set; }

        [Column("CODE")]
        [Required]
        [MaxLength(50)]
        public string Code { get; set; } = string.Empty;

        [Column("DESCRIPTION")]
        [MaxLength(255)]
        public string? Description { get; set; }

        [Column("DISCOUNT_PERCENT", TypeName = "decimal(5,2)")]
        public decimal? DiscountPercent { get; set; }

        [Column("DISCOUNT_AMOUNT", TypeName = "decimal(18,2)")]
        public decimal? DiscountAmount { get; set; }

        [Column("USAGE_LIMIT")]
        [Required]
        public int UsageLimit { get; set; }

        [Column("USAGE_COUNT")]
        public int UsageCount { get; set; } = 0;

        [Column("HOST_ID")]
        [Required]
        public int HostId { get; set; }

        [Column("SERVICECOMBO_ID")]
        [Required]
        public int ServiceComboId { get; set; }

        [Column("IS_ACTIVE")]
        public bool IsActive { get; set; } = true;

        [Column("CREATED_AT")]
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        [Column("UPDATED_AT")]
        public DateTime UpdatedAt { get; set; } = DateTime.Now;

        // Navigation properties - ignored during JSON serialization/deserialization and model validation
        [ForeignKey("HostId")]
        [JsonIgnore]
        [ValidateNever]
        public virtual Account Host { get; set; } = null!;

        [ForeignKey("ServiceComboId")]
        [JsonIgnore]
        [ValidateNever]
        public virtual ServiceCombo? ServiceCombo { get; set; }

        [JsonIgnore]
        [ValidateNever]
        public virtual ICollection<BookingCoupon> BookingCoupons { get; set; } = new List<BookingCoupon>();
    }
}
