using ESCE_SYSTEM.Models;

namespace ESCE_SYSTEM.Repositories.BookingRepository
{
    public interface IBookingRepository
    {
        Task<Booking> GetByIdAsync(int id);
        Task<List<Booking>> GetByUserIdAsync(int userId);
        Task<List<Booking>> GetByComboIdAsync(int comboId);
        Task AddAsync(Booking booking);
        Task UpdateAsync(Booking booking);
    }
}

