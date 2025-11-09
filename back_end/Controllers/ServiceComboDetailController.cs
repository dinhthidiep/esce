using Microsoft.AspNetCore.Mvc;
using ESCE_SYSTEM.Services;
using ESCE_SYSTEM.Models;
using ESCE_SYSTEM.DTOs;
using System.Linq;

namespace ESCE_SYSTEM.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ServiceComboDetailController : ControllerBase
    {
        private readonly IServiceComboDetailService _service;

        public ServiceComboDetailController(IServiceComboDetailService service)
        {
            _service = service;
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

        [HttpGet("combo/{serviceComboId}")]
        public async Task<IActionResult> GetServicesByComboId(int serviceComboId)
        {
            var details = await _service.GetByServiceComboIdAsync(serviceComboId);
            var services = details.Select(d => d.Service).ToList();
            return Ok(services);
        }

        [HttpGet("service/{serviceId}")]
        public async Task<IActionResult> GetByServiceId(int serviceId)
        {
            var result = await _service.GetByServiceIdAsync(serviceId);
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ServiceComboDetailCreateDto dto)
        {
            try
            {
                Console.WriteLine("=== ServiceComboDetail Create Endpoint Called ===");
                Console.WriteLine($"Received DTO: {dto != null}");
                
                if (dto == null)
                {
                    Console.WriteLine("DTO is null!");
                    return BadRequest(new { message = "ServiceComboDetail data is required" });
                }

                Console.WriteLine($"DTO values - ServiceComboId: {dto.ServiceComboId}, ServiceId: {dto.ServiceId}, Quantity: {dto.Quantity}");
                Console.WriteLine($"ModelState.IsValid: {ModelState.IsValid}");
                
                // Log all ModelState errors
                if (!ModelState.IsValid)
                {
                    Console.WriteLine("ModelState validation failed. Errors:");
                    foreach (var key in ModelState.Keys)
                    {
                        var errors = ModelState[key]?.Errors;
                        if (errors != null && errors.Count > 0)
                        {
                            Console.WriteLine($"  {key}: {string.Join(", ", errors.Select(e => e.ErrorMessage))}");
                        }
                    }
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

                    Console.WriteLine($"Model validation errors: {string.Join(", ", errorDetails.Select(e => $"{e.Key}: {string.Join(", ", e.Errors)}"))}");

                    return BadRequest(new
                    {
                        type = "https://tools.ietf.org/html/rfc9110#section-15.5.1",
                        title = "One or more validation errors occurred.",
                        status = 400,
                        errors = errorDetails.ToDictionary(e => e.Key, e => (object)e.Errors.ToArray())
                    });
                }

                // Convert DTO to entity
                var serviceComboDetail = new ServiceComboDetail
                {
                    ServiceComboId = dto.ServiceComboId,
                    ServiceId = dto.ServiceId,
                    Quantity = dto.Quantity > 0 ? dto.Quantity : 1
                };

                Console.WriteLine($"Creating ServiceComboDetail: ServiceComboId={serviceComboDetail.ServiceComboId}, ServiceId={serviceComboDetail.ServiceId}, Quantity={serviceComboDetail.Quantity}");

                var result = await _service.CreateAsync(serviceComboDetail);
                Console.WriteLine($"ServiceComboDetail created successfully with ID: {result.Id}");
                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating ServiceComboDetail: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
                }
                return BadRequest(new { message = "An error occurred while creating the service combo detail", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, ServiceComboDetail serviceComboDetail)
        {
            var result = await _service.UpdateAsync(id, serviceComboDetail);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _service.DeleteAsync(id);
            if (!deleted) return NotFound();
            return Ok("Deleted");
        }

        [HttpDelete("combo/{serviceComboId}")]
        public async Task<IActionResult> DeleteByServiceComboId(int serviceComboId)
        {
            var deleted = await _service.DeleteByServiceComboIdAsync(serviceComboId);
            if (!deleted) return NotFound();
            return Ok("All details for this combo have been deleted");
        }
    }
}



