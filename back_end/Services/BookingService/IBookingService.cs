using ESCE_SYSTEM.DTOs.Booking;

namespace ESCE_SYSTEM.Services.BookingService
{
    public interface IBookingService
    {
        Task<BookingResponseDto> CreateBookingAsync(CreateBookingDto createBookingDto);
        Task<List<BookingResponseDto>> GetUserBookingsAsync();
        Task<BookingResponseDto> GetBookingByIdAsync(int id);
        Task CancelBookingAsync(int id);
    }
}

