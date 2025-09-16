using System;
using System.Collections.Generic;

namespace ESCE_SYSTEM.Models
{
    public partial class ComplaintAction
    {
        public int Id { get; set; }
        public int ComplaintId { get; set; }
        public int HandlerId { get; set; }
        public string? ActionNote { get; set; }
        public DateTime? ActionDate { get; set; }
        public string? StatusAfter { get; set; }

        public virtual Complaint Complaint { get; set; } = null!;
        public virtual Account Handler { get; set; } = null!;
    }
}
