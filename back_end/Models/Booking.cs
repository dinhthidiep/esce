using System;
using System.Collections.Generic;

namespace ESCE_SYSTEM.Models
{
    public partial class Booking
    {
        public Booking()
        {
            BookingPromotions = new HashSet<BookingPromotion>();
            Complaints = new HashSet<Complaint>();
            Payments = new HashSet<Payment>();
        }

        public int Id { get; set; }
        public int UserId { get; set; }
        public int TourId { get; set; }
        public DateTime? BookingDate { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int Quantity { get; set; }
        public decimal TotalAmount { get; set; }
        public string? Notes { get; set; }
        public string? Status { get; set; }

        public virtual Tour Tour { get; set; } = null!;
        public virtual Account User { get; set; } = null!;
        public virtual ICollection<BookingPromotion> BookingPromotions { get; set; }
        public virtual ICollection<Complaint> Complaints { get; set; }
        public virtual ICollection<Payment> Payments { get; set; }
    }
}
