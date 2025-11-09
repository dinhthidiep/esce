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

        public Task<ServiceCombo?> GetByNameAsync(string name)
        {
            return Task.FromResult(_context.ServiceCombos.FirstOrDefault(sc => sc.Name == name));
        }
        public async Task<IEnumerable<ServiceCombo>> GetByHostIdAsync(int hostId)
        {
            return await _context.ServiceCombos
                .Where(sc => sc.HostId == hostId)
                .ToListAsync();
        }
        public async Task CreateAsync(ServiceCombo serviceCombo)
        {
            _context.ServiceCombos.Add(serviceCombo);
            await _context.SaveChangesAsync();
        }
        public async Task UpdateAsync(ServiceCombo serviceCombo)
        {
            // Check if entity is already tracked
            var entry = _context.Entry(serviceCombo);
            if (entry.State == EntityState.Detached)
            {
                // Entity is not tracked, use Update() to start tracking
                _context.ServiceCombos.Update(serviceCombo);
            }
            // If entity is already tracked, EF Core will automatically detect changes
            // Just save the changes
            await _context.SaveChangesAsync();
        }
        public async Task DeleteAsync(int id)
        {
            var serviceCombo = await _context.ServiceCombos.FindAsync(id);
            if(serviceCombo == null)
            {
                throw new InvalidOperationException($"ServiceCombo with ID {id} not found");
            }
            
            _context.ServiceCombos.Remove(serviceCombo);
            await _context.SaveChangesAsync();
        }


    }
}
  
  