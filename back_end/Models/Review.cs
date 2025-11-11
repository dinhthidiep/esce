using System;
using System.Collections.Generic;

namespace ESCE_SYSTEM.Models
{
    public partial class Review
    {
        public Review()
        {
            InverseParentReview = new HashSet<Review>();
        }

        public int Id { get; set; }
        public int ComboId { get; set; }
        public int AuthorId { get; set; }
        public int? ParentReviewId { get; set; }
        public int? Rating { get; set; }
        public string Content { get; set; } = null!;
        public DateTime? CreatedAt { get; set; }

        public virtual Account Author { get; set; } = null!;
        public virtual Servicecombo Combo { get; set; } = null!;
        public virtual Review? ParentReview { get; set; }
        public virtual ICollection<Review> InverseParentReview { get; set; }
    }
}
