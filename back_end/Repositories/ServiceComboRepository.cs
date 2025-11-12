using ESCE_SYSTEM.Models;
using Microsoft.EntityFrameworkCore;


namespace ESCE_SYSTEM.Repositories
{
    public class ServiceComboRepository: IServiceComboRepository
    {
        private readonly ESCEContext _context;
        public ServiceComboRepository(ESCEContext context)
        {
            _context = context;
        }
        public async Task<IEnumerable<ServiceCombo>> GetAllAsync()
        {
            return await _context.ServiceCombos.ToListAsync();
        }
        public async Task<ServiceCombo?> GetByIdAsync(int id)
        {
            return await _context.ServiceCombos.FindAsync(id);
        }

        public async Task<ServiceCombo?> GetByNameAsync(string name)
        {
            return _context.ServiceCombos.FirstOrDefault(sc => sc.Name == name);
            
        }
        public async Task CreateAsync(ServiceCombo serviceCombo)
        {
            _context.ServiceCombos.Add(serviceCombo);
            await _context.SaveChangesAsync();
        }
        public async Task UpdateAsync(ServiceCombo serviceCombo)
        {
            _context.ServiceCombos.Update(serviceCombo);
            await _context.SaveChangesAsync();
        }
        public async Task DeleteAsync(int id)
        {
            var serviceCombo = await _context.ServiceCombos.FindAsync(id);
            if(serviceCombo != null)
            {
                // PRIORITY 1: Delete ServiceComboDetails first (due to Restrict constraint)
                var relatedDetails = await _context.ServiceComboDetails
                    .Where(scd => scd.ServiceComboId == id)
                    .ToListAsync();
                
                if (relatedDetails.Any())
                {
                    _context.ServiceComboDetails.RemoveRange(relatedDetails);
                    // Save changes to delete ServiceComboDetails first
                    await _context.SaveChangesAsync();
                }

                // PRIORITY 2: Get related Coupons (using SERVICECOMBO_ID column)
                var relatedCoupons = await _context.Coupons
                    .Where(c => c.ServiceComboId == id)
                    .Select(c => c.Id)
                    .ToListAsync();

                // PRIORITY 3: Delete BookingCoupons that reference these Coupons (must be done before deleting Coupons due to Restrict constraint)
                if (relatedCoupons.Any())
                {
                    var bookingCouponsToDelete = await _context.BookingCoupons
                        .Where(bc => relatedCoupons.Contains(bc.CouponId))
                        .ToListAsync();
                    if (bookingCouponsToDelete.Any())
                    {
                        _context.BookingCoupons.RemoveRange(bookingCouponsToDelete);
                        // Save changes to delete BookingCoupons
                        await _context.SaveChangesAsync();
                    }
                }

                // PRIORITY 4: Delete related Coupons (priority action - delete even if there are related records)
                if (relatedCoupons.Any())
                {
                    var couponsToDelete = await _context.Coupons
                        .Where(c => relatedCoupons.Contains(c.Id))
                        .ToListAsync();
                    _context.Coupons.RemoveRange(couponsToDelete);
                    // Save changes to delete Coupons
                    await _context.SaveChangesAsync();
                }

                // PRIORITY 5: Delete related Bookings (priority action - delete even if there are related records)
                // This will cascade delete their BookingCoupons automatically
                // Note: Database uses COMBO_ID column, but EF Core maps ServiceComboId to it
                var relatedBookings = await _context.Bookings
                    .Where(b => b.ServiceComboId == id)
                    .ToListAsync();
                if (relatedBookings.Any())
                {
                    _context.Bookings.RemoveRange(relatedBookings);
                    // Save changes to delete Bookings
                    await _context.SaveChangesAsync();
                }

                // PRIORITY 6: Now delete the ServiceCombo (after all related records are deleted)
                _context.ServiceCombos.Remove(serviceCombo);
                await _context.SaveChangesAsync();
            }
        }


    }
}
  
  