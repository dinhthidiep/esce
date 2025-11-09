using ESCE_SYSTEM.Models;
using Microsoft.EntityFrameworkCore;

namespace ESCE_SYSTEM.Repositories
{
    public class BookingRepository : IBookingRepository
    {
        private readonly ESCEContext _context;

        public BookingRepository(ESCEContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Booking>> GetAllAsync()
        {
            return await _context.Bookings
                .Include(b => b.User)
                    .ThenInclude(u => u.Role)
                .Include(b => b.ServiceCombo)
                .ToListAsync();
        }

        public async Task<Booking?> GetByIdAsync(int id)
        {
            return await _context.Bookings
                .Include(b => b.User)
                    .ThenInclude(u => u.Role)
                .Include(b => b.ServiceCombo)
                .FirstOrDefaultAsync(b => b.Id == id);
        }

        public async Task<IEnumerable<Booking>> GetByUserIdAsync(int userId)
        {
            return await _context.Bookings
                .Include(b => b.User)
                    .ThenInclude(u => u.Role)
                .Include(b => b.ServiceCombo)
                .Where(b => b.UserId == userId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Booking>> GetByServiceComboIdAsync(int serviceComboId)
        {
            return await _context.Bookings
                .Include(b => b.User)
                    .ThenInclude(u => u.Role)
                .Include(b => b.ServiceCombo)
                .Where(b => b.ServiceComboId == serviceComboId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Booking>> GetByServiceIdAsync(int serviceId)
        {
            // ServiceId is NotMapped, so we can't query by it
            // This method may not be used, but keeping it for interface compatibility
            return await _context.Bookings
                .Include(b => b.User)
                    .ThenInclude(u => u.Role)
                .Include(b => b.ServiceCombo)
                .Where(b => false) // Return empty since ServiceId doesn't exist in DB
                .ToListAsync();
        }

        public async Task CreateAsync(Booking booking)
        {
            _context.Bookings.Add(booking);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Booking booking)
        {
            _context.Bookings.Update(booking);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var booking = await _context.Bookings.FindAsync(id);
            if (booking != null)
            {
                _context.Bookings.Remove(booking);
                await _context.SaveChangesAsync();
            }
        }
    }
}



