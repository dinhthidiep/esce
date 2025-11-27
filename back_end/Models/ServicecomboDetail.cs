using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESCE_SYSTEM.Models
{
    public class ServiceComboDetail
    {
        public int Id { get; set; }
        
        public int ServiceComboId { get; set; }
        public int ServiceId { get; set; }
        public int Quantity { get; set; } = 1;

        [ForeignKey("ServiceComboId")]
        public virtual ServiceCombo ServiceCombo { get; set; } = null!;
        
        [ForeignKey("ServiceId")]
        public virtual Service Service { get; set; } = null!;
    }
}
