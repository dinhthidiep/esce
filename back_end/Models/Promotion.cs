using System;
using System.Collections.Generic;

namespace ESCE_SYSTEM.Models
{
    public partial class Promotion
    {
        public Promotion()
        {
            BookingPromotions = new HashSet<BookingPromotion>();
            TourPromotions = new HashSet<TourPromotion>();
        }

        public int Id { get; set; }
        public string Code { get; set; } = null!;
        public string? Description { get; set; }
        public decimal? DiscountPercent { get; set; }
        public decimal? DiscountAmount { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int CreatedBy { get; set; }
        public string ScopeType { get; set; } = null!;
        public bool? IsActive { get; set; }
        public DateTime? CreatedAt { get; set; }

        public virtual Account CreatedByNavigation { get; set; } = null!;
        public virtual ICollection<BookingPromotion> BookingPromotions { get; set; }
        public virtual ICollection<TourPromotion> TourPromotions { get; set; }
    }
}
