using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESCE_SYSTEM.Models
{
    [Table("BOOKING_COUPONS")]
    public class BookingCoupon
    {
        [Key]
        [Column("ID")]
        public int Id { get; set; }

        [Required]
        [Column("BOOKING_ID")]
        public int BookingId { get; set; }

        [Required]
        [Column("COUPON_ID")]
        public int CouponId { get; set; }

        [Column("APPLIED_AT")]
        public DateTime AppliedAt { get; set; } = DateTime.Now;

        [ForeignKey("BookingId")]
        public virtual Booking Booking { get; set; } = null!;

        [ForeignKey("CouponId")]
        public virtual Coupon Coupon { get; set; } = null!;
    }
}



