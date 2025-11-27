using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESCE_SYSTEM.Models
{
    public class Service
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime UpdatedAt { get; set; } = DateTime.Now;
        public int HostId { get; set; }

        [ForeignKey("HostId")]
        public virtual Account Host { get; set; } = null!;
        
        public virtual ICollection<ServiceComboDetail> ServiceComboDetails { get; set; } = new List<ServiceComboDetail>();
    }
}
