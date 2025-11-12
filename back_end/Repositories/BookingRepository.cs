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
                // Service navigation property is ignored - database doesn't have SERVICE_ID column
                .ToListAsync();
        }

        public async Task<Booking?> GetByIdAsync(int id)
        {
            return await _context.Bookings
                .Include(b => b.User)
                    .ThenInclude(u => u.Role)
                .Include(b => b.ServiceCombo)
                // Service navigation property is ignored - database doesn't have SERVICE_ID column
                .FirstOrDefaultAsync(b => b.Id == id);
        }

        public async Task<IEnumerable<Booking>> GetByUserIdAsync(int userId)
        {
            return await _context.Bookings
                .Include(b => b.User)
                    .ThenInclude(u => u.Role)
                .Include(b => b.ServiceCombo)
                // Service navigation property is ignored - database doesn't have SERVICE_ID column
                .Where(b => b.UserId == userId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Booking>> GetByServiceComboIdAsync(int serviceComboId)
        {
            return await _context.Bookings
                .Include(b => b.User)
                    .ThenInclude(u => u.Role)
                .Include(b => b.ServiceCombo)
                // Service navigation property is ignored - database doesn't have SERVICE_ID column
                .Where(b => b.ServiceComboId == serviceComboId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Booking>> GetByServiceIdAsync(int serviceId)
        {
            // Note: ServiceId doesn't exist in database, so this query will always return empty
            // Keeping method for interface compatibility but it won't work with current schema
            return await _context.Bookings
                .Include(b => b.User)
                    .ThenInclude(u => u.Role)
                .Include(b => b.ServiceCombo)
                // Service navigation property is ignored - database doesn't have SERVICE_ID column
                // This query will not work as ServiceId column doesn't exist
                .Where(b => false) // Always return empty since ServiceId doesn't exist
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



