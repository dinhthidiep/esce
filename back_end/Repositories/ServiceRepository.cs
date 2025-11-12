using ESCE_SYSTEM.Models;
using Microsoft.EntityFrameworkCore;
namespace ESCE_SYSTEM.Repositories
{
    public class ServiceRepository: IServiceRepository
    {
        private readonly ESCEContext _context;
        public ServiceRepository(ESCEContext context)
        {
            _context = context;
        }
        public async Task<IEnumerable<Service>> GetAllAsync()
        {
            return await _context.Services.ToListAsync();

        }
        public async Task<Service?> GetByIdAsync(int id)
        {
            return await _context.Services.FindAsync(id);
        }

        public async Task CreateAsync(Service service)
        {
            _context.Services.Add(service);
            await _context.SaveChangesAsync();
        }
        public async Task UpdateAsync(Service service)
        {
            _context.Services.Update(service);
            await _context.SaveChangesAsync();
        }
        public async Task DeleteAsync(int id)
        {
            var service = await _context.Services.FindAsync(id);
            if (service != null)
            {
                // Delete related ServiceComboDetail records first (due to Restrict constraint)
                var relatedDetails = await _context.ServiceComboDetails
                    .Where(scd => scd.ServiceId == id)
                    .ToListAsync();
                
                if (relatedDetails.Any())
                {
                    _context.ServiceComboDetails.RemoveRange(relatedDetails);
                    // Save changes to delete ServiceComboDetails first
                    await _context.SaveChangesAsync();
                }

                // Now delete the Service (after ServiceComboDetails are deleted)
                _context.Services.Remove(service);
                await _context.SaveChangesAsync();
            }
        }

    }
}
