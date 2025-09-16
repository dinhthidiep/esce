using System;
using System.Collections.Generic;

namespace ESCE_SYSTEM.Models
{
    public partial class Complaint
    {
        public Complaint()
        {
            ComplaintActions = new HashSet<ComplaintAction>();
        }

        public int Id { get; set; }
        public int UserId { get; set; }
        public int? TourId { get; set; }
        public int? BookingId { get; set; }
        public string Title { get; set; } = null!;
        public string Content { get; set; } = null!;
        public string? Status { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        public virtual Booking? Booking { get; set; }
        public virtual Tour? Tour { get; set; }
        public virtual Account User { get; set; } = null!;
        public virtual ICollection<ComplaintAction> ComplaintActions { get; set; }
    }
}
