using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESCE_SYSTEM.Models
{
    public class BookingCoupon
    {
        public int Id { get; set; }

        [Required]
        public int BookingId { get; set; }

        [Required]
        public int CouponId { get; set; }

        public DateTime AppliedAt { get; set; } = DateTime.Now;

        [ForeignKey("BookingId")]
        public virtual Booking Booking { get; set; } = null!;

        [ForeignKey("CouponId")]
        public virtual Coupon Coupon { get; set; } = null!;
    }
}
