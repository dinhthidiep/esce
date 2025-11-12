using Microsoft.AspNetCore.Mvc;
using ESCE_SYSTEM.Services;
using ESCE_SYSTEM.Models;
using ESCE_SYSTEM.DTOs;

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
        public async Task<IActionResult> GetByServiceComboId(int serviceComboId)
        {
            var result = await _service.GetByServiceComboIdAsync(serviceComboId);
            return Ok(result);
        }

        [HttpGet("service/{serviceId}")]
        public async Task<IActionResult> GetByServiceId(int serviceId)
        {
            var result = await _service.GetByServiceIdAsync(serviceId);
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateServiceComboDetailDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            
            // Map DTO to entity (without navigation properties)
            var serviceComboDetail = new ServiceComboDetail
            {
                ServiceComboId = dto.ServiceComboId,
                ServiceId = dto.ServiceId,
                Quantity = dto.Quantity
            };
            
            var result = await _service.CreateAsync(serviceComboDetail);
            return Ok(result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] CreateServiceComboDetailDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            
            // Get existing entity first
            var existing = await _service.GetByIdAsync(id);
            if (existing == null) return NotFound();
            
            // Update only the properties from DTO (navigation properties remain null, which is fine)
            existing.ServiceComboId = dto.ServiceComboId;
            existing.ServiceId = dto.ServiceId;
            existing.Quantity = dto.Quantity;
            
            // Update using the existing entity (which already has navigation properties loaded if needed)
            var result = await _service.UpdateAsync(id, existing);
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



