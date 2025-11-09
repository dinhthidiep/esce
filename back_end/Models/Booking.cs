using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESCE_SYSTEM.Models
{
    [Table("BOOKINGS")]
    public class Booking
    {
        [Column("ID")]
        public int Id { get; set; }

        [Required]
        [Column("USER_ID")]
        public int UserId { get; set; }

        // Database columns (matching actual schema)
        [Column("COMBO_ID")]
        [Required]
        public int ServiceComboId { get; set; }

        [Required]
        [Column("QUANTITY")]
        public int Quantity { get; set; } = 1;

        [Column("TOTAL_AMOUNT", TypeName = "decimal(18,2)")]
        [Required]
        public decimal TotalAmount { get; set; }

        [MaxLength(50)]
        [Column("STATUS")]
        public string Status { get; set; } = "pending"; // pending / confirmed / canceled / paid

        [MaxLength(500)]
        [Column("NOTES")]
        public string? Notes { get; set; }

        [Column("BOOKING_DATE")]
        public DateTime BookingDate { get; set; } = DateTime.Now;

        [Column("START_DATE")]
        [Required]
        public DateTime StartDate { get; set; }

        [Column("END_DATE")]
        [Required]
        public DateTime EndDate { get; set; }

        // Properties not in database - not mapped to avoid errors
        [NotMapped]
        public string BookingNumber { get; set; } = string.Empty;

        [NotMapped]
        public int? ServiceId { get; set; }

        [NotMapped]
        public decimal UnitPrice { get; set; }

        [NotMapped]
        public string ItemType { get; set; } = string.Empty;

        [NotMapped]
        public DateTime? ConfirmedDate { get; set; }

        [NotMapped]
        public DateTime? CompletedDate { get; set; }

        [NotMapped]
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        [NotMapped]
        public DateTime UpdatedAt { get; set; } = DateTime.Now;

        // Navigation properties
        [ForeignKey("UserId")]
        public virtual Account User { get; set; } = null!;

        [ForeignKey("ServiceComboId")]
        public virtual ServiceCombo? ServiceCombo { get; set; }

        // Service navigation removed - ServiceId doesn't exist in database
        // [ForeignKey("ServiceId")]
        // public virtual Service? Service { get; set; }

        public virtual ICollection<BookingCoupon> BookingCoupons { get; set; } = new List<BookingCoupon>();
        public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
    }
}

