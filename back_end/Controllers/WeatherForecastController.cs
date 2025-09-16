using ESCE_SYSTEM.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.Metadata.Internal;

namespace ESCESYSTEM.Controllers

{
    [ApiController]
    [Route("[controller]")]
    public class WeatherForecastController : ControllerBase
    {
        private static readonly string[] Summaries = new[]
        {
            "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
        };

        private readonly ILogger<WeatherForecastController> _logger;
        private readonly ESCEContext _context;


        public WeatherForecastController(ILogger<WeatherForecastController> logger, ESCEContext context)
        {
            _logger = logger;
             _context = context;
        }

        [HttpGet(Name = "GetWeatherForecast")]
        public IEnumerable<Role> Get()
        {
            return _context.Roles.ToList();

        }
    }
}
