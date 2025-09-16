using System;
using System.Collections.Generic;

namespace ESCE_SYSTEM.Models
{
    public partial class BookingPromotion
    {
        public int Id { get; set; }
        public int BookingId { get; set; }
        public int PromotionId { get; set; }
        public DateTime? AppliedAt { get; set; }

        public virtual Booking Booking { get; set; } = null!;
        public virtual Promotion Promotion { get; set; } = null!;
    }
}
