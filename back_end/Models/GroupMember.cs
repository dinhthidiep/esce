using System;
using System.Collections.Generic;

namespace ESCE_SYSTEM.Models
{
    public partial class GroupMember
    {
        public int Id { get; set; }
        public int GroupId { get; set; }
        public int UserId { get; set; }
        public string? Role { get; set; }
        public string? Status { get; set; }
        public DateTime? JoinedAt { get; set; }

        public virtual GroupBooking Group { get; set; } = null!;
        public virtual Account User { get; set; } = null!;
    }
}
