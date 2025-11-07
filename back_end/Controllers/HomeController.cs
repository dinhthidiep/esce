using ESCE_SYSTEM.Services.HomeService;
using Microsoft.AspNetCore.Mvc;

namespace ESCE_SYSTEM.Controllers
{
    [Route("api/home")]
    [ApiController]
    public class HomeController : ControllerBase
    {
        private readonly IHomeService _homeService;

        public HomeController(IHomeService homeService)
        {
            _homeService = homeService;
        }

        [HttpGet("testimonials")]
        public async Task<IActionResult> GetTestimonials([FromQuery] int limit = 3)
        {
            try
            {
                var testimonials = await _homeService.GetTestimonialsAsync(limit);
                return Ok(testimonials);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching testimonials", error = ex.Message });
            }
        }

        [HttpGet("most-liked-combos")]
        public async Task<IActionResult> GetMostLikedCombos([FromQuery] int limit = 3)
        {
            try
            {
                var combos = await _homeService.GetMostLikedCombosAsync(limit);
                return Ok(combos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching most liked combos", error = ex.Message });
            }
        }
    }
}

