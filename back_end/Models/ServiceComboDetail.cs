using System;
using System.Collections.Generic;

namespace ESCE_SYSTEM.Models
{
    public partial class ServicecomboDetail
    {
        public int Id { get; set; }
        public int ServicecomboId { get; set; }
        public int ServiceId { get; set; }
        public int? Quantity { get; set; }

        public virtual Service Service { get; set; } = null!;
        public virtual Servicecombo Servicecombo { get; set; } = null!;
    }
}
