using ESCE_SYSTEM.Repositories;
using ESCE_SYSTEM.Models;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;

namespace ESCE_SYSTEM.Services
{
    public class ServiceComboService: IServiceComboService
    {
        private readonly IServiceComboRepository _repository;
        private readonly ICouponRepository _couponRepository;
        private readonly IBookingRepository _bookingRepository;
        private readonly IReviewRepository _reviewRepository;
        private readonly IServiceComboDetailRepository _serviceComboDetailRepository;
        private readonly ESCEContext _context;
        private readonly IConfiguration _configuration;

        public ServiceComboService(
            IServiceComboRepository repository,
            ICouponRepository couponRepository,
            IBookingRepository bookingRepository,
            IReviewRepository reviewRepository,
            IServiceComboDetailRepository serviceComboDetailRepository,
            ESCEContext context,
            IConfiguration configuration)
        {
            _repository = repository;
            _couponRepository = couponRepository;
            _bookingRepository = bookingRepository;
            _reviewRepository = reviewRepository;
            _serviceComboDetailRepository = serviceComboDetailRepository;
            _context = context;
            _configuration = configuration;
        }

        public async Task<IEnumerable<ServiceCombo>> GetAllAsync()
        {
            return await _repository.GetAllAsync();
        }
        public async Task<ServiceCombo?> GetByIdAsync(int id)
        {
           return await _repository.GetByIdAsync(id);
        }

        public async Task<ServiceCombo?> GetByNameAsync(string name)
        {
            return await _repository.GetByNameAsync(name);
        }
        public async Task<IEnumerable<ServiceCombo>> GetByHostIdAsync(int hostId)
        {
            return await _repository.GetByHostIdAsync(hostId);
        }
        public async Task<ServiceCombo> CreateAsync(ServiceCombo serviceCombo)
        {
             await _repository.CreateAsync(serviceCombo);
            return serviceCombo;
        }
        public async Task<ServiceCombo?> UpdateAsync(int id, ServiceCombo serviceCombo)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return null;

            // Update all fields from the incoming data
            existing.Name = serviceCombo.Name;
            existing.Address = serviceCombo.Address;
            existing.Description = serviceCombo.Description;
            existing.Price = serviceCombo.Price;
            existing.AvailableSlots = serviceCombo.AvailableSlots;
            // Only update Image if a new value is provided (not null)
            if (serviceCombo.Image != null)
            {
                existing.Image = serviceCombo.Image;
            }
            existing.Status = serviceCombo.Status;
            existing.CancellationPolicy = serviceCombo.CancellationPolicy;
            existing.UpdatedAt = DateTime.Now;

            await _repository.UpdateAsync(existing);
            return existing;
        }

        public async Task<ServiceCombo?> DeleteAsync(int id)
        {
            // Get connection string directly from configuration to avoid EF Core entirely
            var connectionString = _configuration.GetConnectionString("DefaultConnection");
            if (string.IsNullOrEmpty(connectionString))
            {
                throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
            }

            // Use a completely fresh connection to avoid any EF Core model mapping
            using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();
            using var transaction = connection.BeginTransaction();
            try
            {
                // Use direct SQL commands to completely bypass EF Core model mapping
                using var command = connection.CreateCommand();
                command.Transaction = transaction;
                var comboIdParam = new SqlParameter("@comboId", id);
                
                // 1. Delete payments for bookings linked to this combo
                command.CommandText = "DELETE FROM PAYMENTS WHERE BOOKING_ID IN (SELECT ID FROM BOOKINGS WHERE COMBO_ID = @comboId)";
                command.Parameters.Clear();
                command.Parameters.Add(comboIdParam);
                await command.ExecuteNonQueryAsync();

                // 2. Delete reviews - delete by COMBO_ID (database schema column name)
                command.CommandText = "DELETE FROM REVIEWS WHERE COMBO_ID = @comboId";
                command.Parameters.Clear();
                command.Parameters.Add(comboIdParam);
                await command.ExecuteNonQueryAsync();

                // 3. Delete booking coupons for bookings linked to this combo
                command.CommandText = "DELETE FROM BOOKING_COUPONS WHERE BOOKING_ID IN (SELECT ID FROM BOOKINGS WHERE COMBO_ID = @comboId)";
                command.Parameters.Clear();
                command.Parameters.Add(comboIdParam);
                await command.ExecuteNonQueryAsync();

                // 4. Delete booking coupons that reference coupons for this combo
                command.CommandText = "DELETE FROM BOOKING_COUPONS WHERE COUPON_ID IN (SELECT ID FROM COUPONS WHERE SERVICECOMBO_ID = @comboId)";
                command.Parameters.Clear();
                command.Parameters.Add(comboIdParam);
                await command.ExecuteNonQueryAsync();

                // 5. Delete bookings using database column name COMBO_ID
                command.CommandText = "DELETE FROM BOOKINGS WHERE COMBO_ID = @comboId";
                command.Parameters.Clear();
                command.Parameters.Add(comboIdParam);
                await command.ExecuteNonQueryAsync();

                // 6. Delete coupons using database column name SERVICECOMBO_ID
                command.CommandText = "DELETE FROM COUPONS WHERE SERVICECOMBO_ID = @comboId";
                command.Parameters.Clear();
                command.Parameters.Add(comboIdParam);
                await command.ExecuteNonQueryAsync();

                // 7. Delete ServiceComboDetails using database column name SERVICECOMBO_ID
                command.CommandText = "DELETE FROM SERVICECOMBO_DETAIL WHERE SERVICECOMBO_ID = @comboId";
                command.Parameters.Clear();
                command.Parameters.Add(comboIdParam);
                await command.ExecuteNonQueryAsync();

                // 8. Now delete the service combo itself using database column name ID
                command.CommandText = "DELETE FROM SERVICECOMBO WHERE ID = @comboId";
                command.Parameters.Clear();
                command.Parameters.Add(comboIdParam);
                await command.ExecuteNonQueryAsync();

                // Commit the transaction
                transaction.Commit();
                Console.WriteLine($"Successfully deleted ServiceCombo {id} and all related records");
                
                // Return a simple object without EF Core tracking
                return new ServiceCombo { Id = id };
            }
            catch (Exception ex)
            {
                // Rollback on any error
                try
                {
                    transaction.Rollback();
                }
                catch { }
                Console.WriteLine($"Error deleting service combo {id}: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                throw;
            }
        }

        

    }
}
