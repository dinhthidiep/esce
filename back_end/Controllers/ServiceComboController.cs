using Microsoft.AspNetCore.Mvc;
using ESCE_SYSTEM.Services;
using ESCE_SYSTEM.Models;
using Microsoft.AspNetCore.Hosting;
using System.IO;

namespace ESCE_SYSTEM.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ServiceComboController : ControllerBase
    {
        private readonly IServiceComboService _service;
        private readonly IWebHostEnvironment _environment;

        public ServiceComboController(IServiceComboService service, IWebHostEnvironment environment)
        {
            _service = service;
            _environment = environment;
        }

        /// <summary>
        /// Safely deletes an image file from the wwwroot/images directory.
        /// Returns true if file was deleted, false if it didn't exist or couldn't be deleted.
        /// </summary>
        private bool DeleteImageFile(string? imageFileName)
        {
            if (string.IsNullOrWhiteSpace(imageFileName))
                return false;

            try
            {
                var imagesDir = Path.Combine(_environment.ContentRootPath, "wwwroot", "images");
                var filePath = Path.Combine(imagesDir, imageFileName);

                // Security check: ensure the file path is within the images directory
                if (!Path.GetFullPath(filePath).StartsWith(Path.GetFullPath(imagesDir), StringComparison.OrdinalIgnoreCase))
                {
                    // Path traversal attempt - log and ignore
                    return false;
                }

                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                    return true;
                }
            }
            catch (Exception ex)
            {
                // Log the error but don't throw - we don't want to fail the operation if file deletion fails
                // In production, you might want to use ILogger here
                System.Diagnostics.Debug.WriteLine($"Failed to delete image file '{imageFileName}': {ex.Message}");
            }

            return false;
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

        [HttpPost]
        public async Task<IActionResult> Create([FromForm] ServiceCombo serviceCombo, IFormFile? imageFile)
        {
            // Handle image upload
            if (imageFile != null && imageFile.Length > 0)
            {
                // Validate file type
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
                var fileExtension = Path.GetExtension(imageFile.FileName).ToLowerInvariant();
                if (!allowedExtensions.Contains(fileExtension))
                {
                    return BadRequest("Invalid file type. Only image files are allowed.");
                }

                // Validate file size (5MB max)
                if (imageFile.Length > 5 * 1024 * 1024)
                {
                    return BadRequest("File size exceeds 5MB limit.");
                }

                // Generate unique filename
                var uniqueFileName = $"{Guid.NewGuid()}{fileExtension}";
                var imagesDir = Path.Combine(_environment.ContentRootPath, "wwwroot", "images");
                
                // Ensure directory exists
                if (!Directory.Exists(imagesDir))
                {
                    Directory.CreateDirectory(imagesDir);
                }

                var filePath = Path.Combine(imagesDir, uniqueFileName);

                // Save file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await imageFile.CopyToAsync(stream);
                }

                // Store only the filename in database
                serviceCombo.Image = uniqueFileName;
            }

            var result = await _service.CreateAsync(serviceCombo);
            return Ok(result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromForm] ServiceCombo serviceCombo, IFormFile? imageFile)
        {
            // Get existing service combo to preserve image if no new file is uploaded
            var existing = await _service.GetByIdAsync(id);
            if (existing == null) return NotFound();

            // Handle image upload if a new file is provided
            if (imageFile != null && imageFile.Length > 0)
            {
                // Validate file type
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
                var fileExtension = Path.GetExtension(imageFile.FileName).ToLowerInvariant();
                if (!allowedExtensions.Contains(fileExtension))
                {
                    return BadRequest("Invalid file type. Only image files are allowed.");
                }

                // Validate file size (5MB max)
                if (imageFile.Length > 5 * 1024 * 1024)
                {
                    return BadRequest("File size exceeds 5MB limit.");
                }

                // Delete old image file before saving new one
                if (!string.IsNullOrWhiteSpace(existing.Image))
                {
                    DeleteImageFile(existing.Image);
                }

                // Generate unique filename
                var uniqueFileName = $"{Guid.NewGuid()}{fileExtension}";
                var imagesDir = Path.Combine(_environment.ContentRootPath, "wwwroot", "images");
                
                // Ensure directory exists
                if (!Directory.Exists(imagesDir))
                {
                    Directory.CreateDirectory(imagesDir);
                }

                var filePath = Path.Combine(imagesDir, uniqueFileName);

                // Save file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await imageFile.CopyToAsync(stream);
                }

                // Store only the filename in database
                serviceCombo.Image = uniqueFileName;
            }
            else
            {
                // Preserve existing image if no new file is uploaded
                serviceCombo.Image = existing.Image;
            }

            var result = await _service.UpdateAsync(id, serviceCombo);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            // Get existing service combo to retrieve image filename before deletion
            var existing = await _service.GetByIdAsync(id);
            if (existing == null) return NotFound();

            // Delete the service combo from database
            var result = await _service.DeleteAsync(id);
            if (result == null) return NotFound();

            // Delete associated image file
            if (!string.IsNullOrWhiteSpace(existing.Image))
            {
                DeleteImageFile(existing.Image);
            }

            return Ok(new { message = "Deleted", id = id });
        }
    }
}



