using System.ComponentModel.DataAnnotations;

namespace ESCE_SYSTEM.DTOs.Payment
{
    public class CreatePaymentDto
    {
        [Required]
        public int BookingId { get; set; }
        
        public string? ReturnUrl { get; set; }
        
        public string? CancelUrl { get; set; }
    }
}

