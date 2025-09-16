using System;
using System.Collections.Generic;

namespace ESCE_SYSTEM.Models
{
    public partial class Tour
    {
        public Tour()
        {
            Bookings = new HashSet<Booking>();
            Complaints = new HashSet<Complaint>();
            GroupBookings = new HashSet<GroupBooking>();
            RequestSupports = new HashSet<RequestSupport>();
            Reviews = new HashSet<Review>();
            TourPromotions = new HashSet<TourPromotion>();
        }

        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string Address { get; set; } = null!;
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int Capacity { get; set; }
        public int AvailableSlots { get; set; }
        public string? Image { get; set; }
        public string? Status { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int HostId { get; set; }

        public virtual Account Host { get; set; } = null!;
        public virtual ICollection<Booking> Bookings { get; set; }
        public virtual ICollection<Complaint> Complaints { get; set; }
        public virtual ICollection<GroupBooking> GroupBookings { get; set; }
        public virtual ICollection<RequestSupport> RequestSupports { get; set; }
        public virtual ICollection<Review> Reviews { get; set; }
        public virtual ICollection<TourPromotion> TourPromotions { get; set; }
    }
}
