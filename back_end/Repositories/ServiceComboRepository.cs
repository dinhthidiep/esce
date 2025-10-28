﻿using Learnasp.Models;
using Learnasp.Repositories;
using Microsoft.EntityFrameworkCore;


namespace Learnasp.Repositories
{
    public class ServiceComboRepository: IServiceComboRepository
    {
        private readonly ApplicationDbContext _context;
        public ServiceComboRepository(ApplicationDbContext context)
        {
            _context = context;
        }
        public async Task<IEnumerable<ServiceCombo>> GetAllAsync()
        {
            return await _context.ServiceCombos.ToListAsync();
        }
        public async Task<ServiceCombo> GetByIdAsync(int id)
        {
            return await _context.ServiceCombos.FindAsync(id);
        }

        public async Task<ServiceCombo> GetByNameAsync(string name)
        {
            return _context.ServiceCombos.Find(name);
            
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
                _context.ServiceCombos.Remove(serviceCombo);
                await _context.SaveChangesAsync();
            }
        }


    }
}
  
  