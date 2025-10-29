using System;
using System.Collections.Generic;

namespace ESCE_SYSTEM.Models
{
    public partial class PostSave
    {
        public int Id { get; set; }
        public int PostId { get; set; }
        public int AccountId { get; set; }
        public DateTime? CreatedAt { get; set; }

        public virtual Account Account { get; set; } = null!;
        public virtual Post Post { get; set; } = null!;
    }
}
