using System;
using System.Collections.Generic;

namespace ESCE_SYSTEM.Models
{
    public partial class GroupBooking
    {
        public GroupBooking()
        {
            GroupMembers = new HashSet<GroupMember>();
        }

        public int Id { get; set; }
        public int TourId { get; set; }
        public int LeaderId { get; set; }
        public string InviteCode { get; set; } = null!;
        public string? Status { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        public virtual Account Leader { get; set; } = null!;
        public virtual Tour Tour { get; set; } = null!;
        public virtual ICollection<GroupMember> GroupMembers { get; set; }
    }
}
