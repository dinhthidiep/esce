using ESCE_SYSTEM.Models;
using Microsoft.EntityFrameworkCore;

namespace ESCE_SYSTEM.Repositories.BookingRepository
{
    public class BookingRepository : IBookingRepository
    {
        private readonly ESCEContext _dbContext;

        public BookingRepository(ESCEContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<Booking> GetByIdAsync(int id)
        {
            return await _dbContext.Bookings
                .Include(b => b.Combo)
                .Include(b => b.User)
                .Include(b => b.BookingCoupons)
                .FirstOrDefaultAsync(b => b.Id == id);
        }

        public async Task<List<Booking>> GetByUserIdAsync(int userId)
        {
            return await _dbContext.Bookings
                .Include(b => b.Combo)
                .Where(b => b.UserId == userId)
                .OrderByDescending(b => b.BookingDate)
                .ToListAsync();
        }

        public async Task<List<Booking>> GetByComboIdAsync(int comboId)
        {
            return await _dbContext.Bookings
                .Include(b => b.User)
                .Where(b => b.ComboId == comboId)
                .OrderByDescending(b => b.BookingDate)
                .ToListAsync();
        }

        public async Task AddAsync(Booking booking)
        {
            _dbContext.Bookings.Add(booking);
            await _dbContext.SaveChangesAsync();
        }

        public async Task UpdateAsync(Booking booking)
        {
            _dbContext.Bookings.Update(booking);
            await _dbContext.SaveChangesAsync();
        }
    }
}

