using ESCE_SYSTEM.DTOs.Payment;

namespace ESCE_SYSTEM.Services.PaymentService
{
    public interface IPaymentService
    {
        Task<PaymentResponseDto> CreatePaymentAsync(CreatePaymentDto createPaymentDto);
        Task<PaymentResponseDto> HandlePaymentCallbackAsync(int orderCode, string status);
        Task<PaymentResponseDto> GetPaymentByIdAsync(int id);
        Task<IEnumerable<PaymentResponseDto>> GetPaymentsByBookingIdAsync(int bookingId);
        Task<PaymentResponseDto> UpdatePaymentStatusAsync(UpdatePaymentStatusDto updateDto);
    }
}

