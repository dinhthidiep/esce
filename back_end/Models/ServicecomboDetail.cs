using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;

namespace ESCE_SYSTEM.Models
{
    [Table("SERVICECOMBO_DETAIL")]
    public class ServiceComboDetail
    {
        public int Id { get; set; }
        
        // Foreign Key to ServiceCombo
        [Column("SERVICECOMBO_ID")]
        public int ServiceComboId { get; set; }

        // Foreign Key to Service
        [Column("SERVICE_ID")]
        public int ServiceId { get; set; }
        
        public int Quantity { get; set; } = 1;
        
        // Navigation properties - ignored during JSON serialization/deserialization and model validation
        [JsonIgnore]
        [ValidateNever]
        public ServiceCombo ServiceCombo { get; set; } = null!;
        
        [JsonIgnore]
        [ValidateNever]
        public Service Service { get; set; } = null!;
    }
}

