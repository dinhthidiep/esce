using System;
using System.Collections.Generic;

namespace ESCE_SYSTEM.Models
{
    public partial class RequestSupport
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int? TourId { get; set; }
        public string? SupportType { get; set; }
        public string Content { get; set; } = null!;
        public string? Status { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        public virtual Tour? Tour { get; set; }
        public virtual Account User { get; set; } = null!;
    }
}
