using ESCE_SYSTEM.Enums;

namespace ESCE_SYSTEM.DTOs.Payment
{
    public class PaymentResponseDto
    {
        public int Id { get; set; }
        public int BookingId { get; set; }
        public decimal Amount { get; set; }
        public DateTime? PaymentDate { get; set; }
        public string? Method { get; set; }
        public PaymentStatus Status { get; set; }
        public string? CheckoutUrl { get; set; }
    }
}

