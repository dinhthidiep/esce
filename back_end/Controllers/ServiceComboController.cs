using Microsoft.AspNetCore.Mvc;
using ESCE_SYSTEM.Services;
using ESCE_SYSTEM.Models;
using ESCE_SYSTEM.Services.UserContextService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using ESCE_SYSTEM.DTOs;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;

namespace ESCE_SYSTEM.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ServiceComboController : ControllerBase
    {
        private readonly IServiceComboService _service;
        private readonly IUserContextService _userContextService;
        private readonly IConfiguration _configuration;

        public ServiceComboController(IServiceComboService service, IUserContextService userContextService, IConfiguration configuration)
        {
            _service = service;
            _userContextService = userContextService;
            _configuration = configuration;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _service.GetAllAsync();
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult> GetById(int id)
        {
            var result = await _service.GetByIdAsync(id);
            if (result == null) return NotFound();

            return Ok(result);
        }

        [HttpGet("name/{name}")]
        public async Task<ActionResult> GetByName(string name)
        {
            var result = await _service.GetByNameAsync(name);
            if (result == null) return NotFound();

            return Ok(result);
        }

        [HttpGet("mine")]
        [Authorize]
        public async Task<IActionResult> GetMine()
        {
            var userIdString = _userContextService.UserId;
            if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out int userId))
            {
                return Unauthorized("Invalid user information");
            }

            var result = await _service.GetByHostIdAsync(userId);
            return Ok(result);
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create(ServiceCombo serviceCombo)
        {
            var userIdString = _userContextService.UserId;
            if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out int userId))
            {
                return Unauthorized("Invalid user information");
            }

            // Set HostId from JWT token for security
            serviceCombo.HostId = userId;
            var result = await _service.CreateAsync(serviceCombo);
            return Ok(result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] ServiceComboUpdateDto updateDto)
        {
            Console.WriteLine($"PUT request received for ServiceCombo ID: {id}");

            if (updateDto == null)
            {
                Console.WriteLine("UpdateDto is null");
                return BadRequest("ServiceCombo data is required");
            }

            // Validate model state
            if (!ModelState.IsValid)
            {
                var errorDetails = ModelState
                    .Where(ms => ms.Value != null && ms.Value.Errors.Count > 0)
                    .Select(ms => new
                    {
                        Key = ms.Key,
                        Errors = ms.Value!.Errors.Select(e => e.ErrorMessage).ToList()
                    })
                    .ToList();

                var errorMessages = string.Join("; ", errorDetails
                    .SelectMany(ed => ed.Errors.Select(err => $"{ed.Key}: {err}")));

                Console.WriteLine($"Model validation errors: {errorMessages}");
                Console.WriteLine($"Received data - Name: '{updateDto.Name}', Address: '{updateDto.Address}', Price: {updateDto.Price}, AvailableSlots: {updateDto.AvailableSlots}");
                
                return BadRequest(new { 
                    message = "Validation errors occurred",
                    errors = errorDetails.ToDictionary(ed => ed.Key, ed => ed.Errors)
                });
            }

            // Convert DTO to ServiceCombo entity
            var serviceCombo = new ServiceCombo
            {
                Name = updateDto.Name,
                Address = updateDto.Address,
                Description = updateDto.Description,
                Price = updateDto.Price,
                AvailableSlots = updateDto.AvailableSlots,
                Image = updateDto.Image,
                Status = updateDto.Status,
                CancellationPolicy = updateDto.CancellationPolicy
            };

            // Log the received data for debugging
            Console.WriteLine($"Updating ServiceCombo ID: {id}");
            Console.WriteLine($"Name: {serviceCombo.Name}, Address: {serviceCombo.Address}");

            try
            {
                var result = await _service.UpdateAsync(id, serviceCombo);
                if (result == null)
                {
                    Console.WriteLine("Update result is null");
                    return NotFound($"ServiceCombo with ID {id} not found");
                }
                Console.WriteLine("Update successful");
                return Ok(result);
            }
            catch (DbUpdateException dbEx)
            {
                Console.WriteLine($"Database error: {dbEx.Message}");
                Console.WriteLine($"Inner exception: {dbEx.InnerException?.Message}");
                return BadRequest($"Database error: {dbEx.InnerException?.Message ?? dbEx.Message}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return BadRequest($"Error updating service combo: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                Console.WriteLine($"Delete request received for ServiceCombo ID: {id}");

                // Verify the user owns this service combo
                var userIdString = _userContextService.UserId;
                if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out int userId))
                {
                    Console.WriteLine("Invalid user information in delete request");
                    return Unauthorized(new { message = "Invalid user information" });
                }

                // Verify ownership using direct SQL to avoid model mapping issues
                var connectionString = _configuration.GetConnectionString("DefaultConnection");
                if (string.IsNullOrEmpty(connectionString))
                {
                    return BadRequest(new { message = "Database connection not configured" });
                }
                
                int? hostId = null;
                using var connection = new SqlConnection(connectionString);
                await connection.OpenAsync();
                try
                {
                    using var command = connection.CreateCommand();
                    command.CommandText = "SELECT HOST_ID FROM SERVICECOMBO WHERE ID = @id";
                    command.Parameters.Add(new SqlParameter("@id", id));
                    
                    var hostIdResult = await command.ExecuteScalarAsync();
                    if (hostIdResult != null && hostIdResult != DBNull.Value)
                    {
                        hostId = Convert.ToInt32(hostIdResult);
                    }
                }
                finally
                {
                    await connection.CloseAsync();
                }
                
                if (hostId == null)
                {
                    Console.WriteLine($"ServiceCombo {id} not found");
                    return NotFound(new { message = $"ServiceCombo with ID {id} not found" });
                }

                // Check if the user owns this service combo
                if (hostId.Value != userId)
                {
                    Console.WriteLine($"User {userId} attempted to delete ServiceCombo {id} owned by {hostId.Value}");
                    return StatusCode(403, new { message = "You do not have permission to delete this service combo" });
                }

                Console.WriteLine($"Attempting to delete ServiceCombo {id} owned by user {userId}");
                var deleteResult = await _service.DeleteAsync(id);
                if (deleteResult == null)
                {
                    Console.WriteLine($"DeleteAsync returned null for ServiceCombo {id}");
                    return NotFound(new { message = $"ServiceCombo with ID {id} not found" });
                }

                Console.WriteLine($"ServiceCombo {id} deleted successfully by user {userId}");
                return Ok(new { message = "Service combo deleted successfully", id = id });
            }
            catch (DbUpdateException dbEx)
            {
                Console.WriteLine($"Database error deleting service combo {id}: {dbEx.Message}");
                Console.WriteLine($"Inner exception: {dbEx.InnerException?.Message}");
                Console.WriteLine($"Stack trace: {dbEx.StackTrace}");
                
                var innerMessage = dbEx.InnerException?.Message ?? "";
                
                // Check if it's a foreign key constraint violation
                if (innerMessage.Contains("FOREIGN KEY") || 
                    innerMessage.Contains("REFERENCE") ||
                    innerMessage.Contains("The DELETE statement conflicted"))
                {
                    return BadRequest(new { 
                        message = "Cannot delete this service combo because it has related records (bookings, coupons, reviews, etc.). Please remove or cancel related records first.",
                        error = "Foreign key constraint violation",
                        details = innerMessage
                    });
                }
                
                return BadRequest(new { 
                    message = "Database error occurred while deleting service combo",
                    error = innerMessage,
                    details = dbEx.Message
                });
            }
            catch (InvalidOperationException ioEx)
            {
                Console.WriteLine($"Invalid operation deleting service combo {id}: {ioEx.Message}");
                return NotFound(new { 
                    message = ioEx.Message,
                    error = "Service combo not found"
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deleting service combo {id}: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return BadRequest(new { 
                    message = "An error occurred while deleting the service combo",
                    error = ex.Message,
                    type = ex.GetType().Name
                });
            }
        }
    }
}



