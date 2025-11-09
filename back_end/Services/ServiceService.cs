using Microsoft.EntityFrameworkCore;
using ESCE_SYSTEM.Models;
using ESCE_SYSTEM.Repositories;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;

namespace ESCE_SYSTEM.Services
{
    public class ServiceService : IServiceService
    {
        private readonly IServiceRepository _repository;
        private readonly IConfiguration _configuration;
        
        public ServiceService (IServiceRepository repository, IConfiguration configuration)
        {
            _repository = repository;
            _configuration = configuration;
        }

        public async Task<IEnumerable<Service>> GetAllAsync()
        {
            return await _repository.GetAllAsync();
        }

        public async Task<Service?> GetByIdAsync(int id)
        {
            return await _repository.GetByIdAsync(id);
        }
        public async Task<Service> CreateAsync(Service service)
        {
            await _repository.CreateAsync(service);
            return service;
        }
        public async Task<Service?> UpdateAsync(int id, Service service)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return null;

            existing.Name = service.Name;
            existing.Description = service.Description;
            existing.Price = service.Price;
            existing.Updated_At = DateTime.Now;

            await _repository.UpdateAsync(existing);
            return existing;
        }
        public async Task<bool> DeleteAsync(int id)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return false;

            // Get connection string
            var connectionString = _configuration.GetConnectionString("DefaultConnection");
            if (string.IsNullOrEmpty(connectionString))
            {
                throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
            }

            // Use direct SQL to handle foreign key constraints
            using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();
            using var transaction = connection.BeginTransaction();
            try
            {
                using var command = connection.CreateCommand();
                command.Transaction = transaction;
                var serviceIdParam = new SqlParameter("@serviceId", id);

                // 1. Delete ServiceComboDetails that reference this service
                command.CommandText = "DELETE FROM SERVICECOMBO_DETAIL WHERE SERVICE_ID = @serviceId";
                command.Parameters.Clear();
                command.Parameters.Add(serviceIdParam);
                await command.ExecuteNonQueryAsync();

                // 2. Delete the service itself
                command.CommandText = "DELETE FROM SERVICE WHERE ID = @serviceId";
                command.Parameters.Clear();
                command.Parameters.Add(serviceIdParam);
                await command.ExecuteNonQueryAsync();

                // Commit the transaction
                await transaction.CommitAsync();
                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<IEnumerable<Service>> GetByHostIdAsync(int hostId)
        {
            return await _repository.GetByHostIdAsync(hostId);
        }




    }
}
//        private readonly ApplicationDbContext _context;

//        public ServiceService(ApplicationDbContext context)
//        {
//            _context = context;
//        }

//        public async Task<IEnumerable<Service>> GetAllAsync()
//        {
//            return await _context.Services.ToListAsync();
//        }

//        public async Task<Service?> GetByIdAsync(int id)
//        {
//            return await _context.Services.FindAsync(id); 
//         }

//        public async Task<Service> CreateAsync(Service service)
//        {
//             _context.Services.Add(service);
//            await _context.SaveChangesAsync();

//            return service;
                 
//        }


//        public async Task<Service?> UpdateAsync(int id, Service service)
//        {
//            var exitsting = await _context.Services.FindAsync(id);
//            if (exitsting == null) return null;
//            exitsting.Name = service.Name;
//            exitsting.Description = service.Description;
//            exitsting.Price = service.Price;
//            exitsting.Updated_At= DateTime.Now;
//            await _context.SaveChangesAsync();
//               return exitsting;     
           
//        }

//        public async Task<bool> DeleteAsync(int id)
//        {
//            var exitsting = await _context.Services.FindAsync(id);
//            if (exitsting == null) return false;    
//            _context.Services.Remove(exitsting);
//            await _context.SaveChangesAsync();
//            return true;
//        }
//    }
//}
