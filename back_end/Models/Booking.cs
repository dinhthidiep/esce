using System;
using System.Collections.Generic;

namespace ESCE_SYSTEM.Models
{
    public partial class Booking
    {
        public Booking()
        {
            BookingCoupons = new HashSet<BookingCoupon>();
            Payments = new HashSet<Payment>();
        }

        public int Id { get; set; }
        public int UserId { get; set; }
        public int ComboId { get; set; }
        public DateTime? BookingDate { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int Quantity { get; set; }
        public decimal TotalAmount { get; set; }
        public string? Notes { get; set; }
        public string? Status { get; set; }

        public virtual Servicecombo Combo { get; set; } = null!;
        public virtual Account User { get; set; } = null!;
        public virtual ICollection<BookingCoupon> BookingCoupons { get; set; }
        public virtual ICollection<Payment> Payments { get; set; }
    }
}
