using ESCE_SYSTEM.Services.FileService;
using Microsoft.AspNetCore.Mvc;

namespace ESCE_SYSTEM.Controllers
{
    [Route("api/file")]
    [ApiController]
    public class FileController : ControllerBase
    {
        private readonly IFileService _fileService;

        public FileController(IFileService fileService)
        {
            _fileService = fileService;
        }

        [HttpPost("upload-image")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadImage(IFormFile image)
        {
            try
            {
                var filePath = await _fileService.UploadFileAsync(image, "images");
                return Ok(new { url = $"{Request.Scheme}://{Request.Host}{filePath}" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while uploading image", error = ex.Message });
            }
        }
    }
}

