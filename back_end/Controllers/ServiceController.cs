using Microsoft.AspNetCore.Mvc;
using ESCE_SYSTEM.Services;
using ESCE_SYSTEM.Models;
using ESCE_SYSTEM.Services.UserContextService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.VisualBasic;
using System.Data.Common;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;

namespace ESCE_SYSTEM.Controllers
{
    [ApiController]
    [Route("api/[controller]")]

    public class ServiceController : ControllerBase
    {
        private readonly IServiceService _service;
        private readonly IUserContextService _userContextService;
        private readonly IConfiguration _configuration;

        public ServiceController(IServiceService service, IUserContextService userContextService, IConfiguration configuration)
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

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] Service service)
        {
            try
            {
                // Get user ID from JWT token
                var userIdString = _userContextService.UserId;
                if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out int userId))
                {
                    return Unauthorized(new { message = "Invalid user information" });
                }

                // Set HostId from authenticated user for security
                service.HostId = userId;
                service.Created_At = DateTime.Now;
                service.Updated_At = DateTime.Now;

                var result = await _service.CreateAsync(service);
                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating service: {ex.Message}");
                return BadRequest(new { message = "An error occurred while creating the service", error = ex.Message });
            }
        }

        [HttpGet("mine")]
        [Authorize]
        public async Task<IActionResult> GetMine()
        {
            var userIdString = _userContextService.UserId;
            if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out int userId))
            {
                return Unauthorized(new { message = "Invalid user information" });
            }

            var result = await _service.GetByHostIdAsync(userId);
            return Ok(result);
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> Update(int id, [FromBody] Service service)
        {
            try
            {
                var userIdString = _userContextService.UserId;
                if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out int userId))
                {
                    return Unauthorized(new { message = "Invalid user information" });
                }

                // Verify ownership using direct SQL to avoid EF Core timeout issues
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
                    command.CommandText = "SELECT HOST_ID FROM SERVICE WHERE ID = @id";
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
                    return NotFound(new { message = "Service not found" });
                }

                if (hostId.Value != userId)
                {
                    return StatusCode(403, new { message = "You do not have permission to update this service" });
                }

                // Get Created_At using raw SQL to avoid EF Core timeout
                DateTime? createdAt = null;
                using var connection2 = new SqlConnection(connectionString);
                await connection2.OpenAsync();
                try
                {
                    using var command2 = connection2.CreateCommand();
                    command2.CommandText = "SELECT CREATED_AT FROM SERVICE WHERE ID = @id";
                    command2.Parameters.Add(new SqlParameter("@id", id));

                    var createdAtResult = await command2.ExecuteScalarAsync();
                    if (createdAtResult != null && createdAtResult != DBNull.Value)
                    {
                        createdAt = Convert.ToDateTime(createdAtResult);
                    }
                }
                finally
                {
                    await connection2.CloseAsync();
                }

                if (createdAt == null)
                {
                    return NotFound(new { message = "Service not found" });
                }

                // Preserve HostId and Created_At from existing service
                service.HostId = hostId.Value;
                service.Created_At = createdAt.Value;
                service.Updated_At = DateTime.Now;

                var result = await _service.UpdateAsync(id, service);
                if (result == null)
                {
                    return NotFound(new { message = "Service not found" });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating service: {ex.Message}");
                return StatusCode(500, new { message = "An error occurred while updating the service", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var userIdString = _userContextService.UserId;
                if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out int userId))
                {
                    return Unauthorized(new { message = "Invalid user information" });
                }

                // Verify ownership using direct SQL to avoid EF Core timeout issues
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
                    command.CommandText = "SELECT HOST_ID FROM SERVICE WHERE ID = @id";
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
                    return NotFound(new { message = "Service not found" });
                }

                if (hostId.Value != userId)
                {
                    return StatusCode(403, new { message = "You do not have permission to delete this service" });
                }

                var deleted = await _service.DeleteAsync(id);
                if (!deleted)
                {
                    return NotFound(new { message = "Service not found" });
                }

                return Ok(new { message = "Service deleted successfully" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deleting service: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { message = "An error occurred while deleting the service", error = ex.Message });
            }
        }
        


    }

}



//    [ApiController]
//    [Route("api/[controller]")]
//    public class ServiceController : ControllerBase
//    {
//        private readonly ApplicationDbContext _context;
//        public ServiceController(ApplicationDbContext context)
//        {
//            _context = context;
//        }

//        [HttpGet]
//        public IEnumerable<Service> GetAll()
//        {
//            return _context.Services;

//        }

//        [HttpGet("{id}")]
//        public IActionResult GetById(int id)
//        {
//            var service = _context.Services.Find(id);
//            if (service == null)
//                return NotFound();
//            return Ok(service);

//        }

//        [HttpPost]
//        public IActionResult Create(Service service)
//        {
//            _context.Services.Add(service);
//            _context.SaveChanges();
//            return CreatedAtAction(nameof(GetById), new { id = service.Id }, service);

//        }

//        [HttpPut("{id}")]
//        public IActionResult Update(int id, Service updatedService)
//        {
//            var service = _context.Services.Find(id);
//            if (service == null)
//                return NotFound();
//            service.Name = updatedService.Name;
//            service.Description = updatedService.Description;
//            service.Price = updatedService.Price;
//            service.Updated_At = updatedService.Updated_At;
//            _context.SaveChanges();
//            return Ok(service);
//        }

//        [HttpDelete("{id}")]

//        public IActionResult Delete(int id)
//        {
//            var service = _context.Services.Find(id);
//            if (service == null)
//                return NotFound();
//            _context.Remove(service);
//            _context.SaveChanges();
//            return NoContent();
//        }

//    }
//}


































































/*
namespace Learnasp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ServiceController : ControllerBase
    {
        private static List<Service> services = new List<Service>()
        {
            new Service { Id = 1, Name="Cà phê sáng", Description ="Bạn có thể oder bất kỳ loại cà phê nào có trong menu của chúng tôi",
                Price = 25000 },
            new Service {Id = 2, Name ="Lẩu gà cho 2 người", Description ="Lẩu gà bạn có thể chọn vị và báo trước cho mình nhé (Lá é, lá giang, tây bắc", Price =300000}

        };

        [HttpGet]
        public IEnumerable<Service> GetAll()
        {
            return services;
        }

        [HttpGet("{id}")]
        public ActionResult<Service> GetById(int id)
        {
            var service = services.FirstOrDefault(s => s.Id == id);
            if (service == null)
                return NotFound();
            return service;
        }

        [HttpPost]
        public ActionResult<Service> Create(Service service)

        {
            service.Id = services.Count + 1;
            services.Add(service);
            return CreatedAtAction(nameof(GetAll), new { id = service.Id }, service);
        }


        [HttpPut("{id}")]
        public IActionResult Update(int id, Service updatedService)
        {
            var service = services.FirstOrDefault(s => s.Id == id);
            if (service == null)
                return NotFound(new { message = "Không tìm thấy sản phẩm " });
            service.Name = updatedService.Name;
            service.Description = updatedService.Description;
            service.Price = updatedService.Price;
            service.Updated_At = updatedService.Updated_At;
            return Ok(service);


        }

        [HttpDelete("{id}") ]
        public IActionResult Delete(int id)
        {
            var service = services.FirstOrDefault(s => s.Id == id);
            if (service == null)
                return NotFound(new { message = "Không tìm thấy dịch vụ" });
           services.Remove(service);
            //return Ok(new {message ="Bạn đã xóa dịch vụ thành công "});
            return NoContent();

        }

    }



}
*/