using ESCE_SYSTEM.Enums;

namespace ESCE_SYSTEM.DTOs.Payment
{
    public class UpdatePaymentStatusDto
    {
        public int PaymentId { get; set; }
        public PaymentStatus Status { get; set; }
    }
}

