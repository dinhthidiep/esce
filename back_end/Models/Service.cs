﻿using System;
using System.Collections.Generic;

namespace ESCE_SYSTEM.Models
{
    public partial class Service
    {
        public Service()
        {
            ServicecomboDetails = new HashSet<ServicecomboDetail>();
        }

        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public int HostId { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        public virtual Account Host { get; set; } = null!;
        public virtual ICollection<ServicecomboDetail> ServicecomboDetails { get; set; }
    }
}
