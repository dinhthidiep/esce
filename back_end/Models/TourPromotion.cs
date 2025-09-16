using System;
using System.Collections.Generic;

namespace ESCE_SYSTEM.Models
{
    public partial class TourPromotion
    {
        public int Id { get; set; }
        public int TourId { get; set; }
        public int PromotionId { get; set; }

        public virtual Promotion Promotion { get; set; } = null!;
        public virtual Tour Tour { get; set; } = null!;
    }
}
