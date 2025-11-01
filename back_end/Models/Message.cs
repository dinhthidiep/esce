﻿using System;
using System.Collections.Generic;

namespace ESCE_SYSTEM.Models
{
    public partial class Message
    {
        public int Id { get; set; }
        public int SenderId { get; set; }
        public int ReceiverId { get; set; }
        public string Content { get; set; } = null!;
        public DateTime? CreatedAt { get; set; }
        public bool? IsRead { get; set; }

        public virtual Account Receiver { get; set; } = null!;
        public virtual Account Sender { get; set; } = null!;
    }
}
