using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESCE_SYSTEM.Models
{
    public class Payment
    {
        public int Id { get; set; }
        
        [Required]
        public int BookingId { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }
        
        public DateTime? PaymentDate { get; set; }
        
        [MaxLength(50)]
        public string? PaymentMethod { get; set; }
        
        [MaxLength(100)]
        public string? TransactionId { get; set; }
        
        [MaxLength(50)]
        public string Status { get; set; } = "pending";
        
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? UpdatedAt { get; set; }

        [ForeignKey("BookingId")]
        public virtual Booking Booking { get; set; } = null!;
    }
}
