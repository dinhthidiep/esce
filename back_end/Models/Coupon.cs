using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;

namespace ESCE_SYSTEM.Models
{
    public class Coupon
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string Code { get; set; } = string.Empty;

        [MaxLength(255)]
        public string? Description { get; set; }

        [Column(TypeName = "decimal(5,2)")]
        public decimal? DiscountPercent { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? DiscountAmount { get; set; }

        [Required]
        public int UsageLimit { get; set; }

        public int UsageCount { get; set; } = 0;

        [Required]
        public int HostId { get; set; }

        [Required] // Database requires NOT NULL
        public int ServiceComboId { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public DateTime UpdatedAt { get; set; } = DateTime.Now;

        // Navigation properties
        [ValidateNever]
        public virtual Account? Host { get; set; }

        [ValidateNever]
        public virtual ServiceCombo? ServiceCombo { get; set; }

        [ValidateNever]
        public virtual ICollection<BookingCoupon> BookingCoupons { get; set; } = new List<BookingCoupon>();
    }
}



