using ESCE_SYSTEM.DTOs.Tours;
using ESCE_SYSTEM.Services.TourService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ESCE_SYSTEM.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TourController : ControllerBase
    {
        private readonly ITourService _tourService;
        private readonly ILogger<TourController> _logger;

        public TourController(ITourService tourService, ILogger<TourController> logger)
        {
            _tourService = tourService;
            _logger = logger;
        }

        /// <summary>
        /// Lấy danh sách tất cả tour
        /// </summary>
        [HttpGet("TourList")]
        public async Task<ActionResult<IEnumerable<TourResponseDto>>> GetAllTours()
        {
            try
            {
                var tours = await _tourService.GetAllToursAsync();
                return Ok(tours);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy danh sách tour");
                return StatusCode(500, "Có lỗi xảy ra khi lấy danh sách tour");
            }
        }

        /// <summary>
        /// Lấy tour theo ID
        /// </summary>
        [HttpGet("GetTourById/{id}")]
        public async Task<ActionResult<TourResponseDto>> GetTourById(int id)
        {
            try
            {
                var tour = await _tourService.GetTourByIdAsync(id);
                if (tour == null)
                {
                    return NotFound($"Không tìm thấy tour với ID {id}");
                }
                return Ok(tour);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy tour với ID {TourId}", id);
                return StatusCode(500, "Có lỗi xảy ra khi lấy thông tin tour");
            }
        }

        /// <summary>
        /// Tạo tour mới
        /// </summary>
        [HttpPost("CreateTour")]
        public async Task<ActionResult<TourResponseDto>> CreateTour([FromBody] CreateTourDto createTourDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var tour = await _tourService.CreateTourAsync(createTourDto);
                return CreatedAtAction(nameof(GetTourById), new { id = tour.Id }, tour);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo tour mới");
                return StatusCode(500, "Có lỗi xảy ra khi tạo tour");
            }
        }

        /// <summary>
        /// Cập nhật tour
        /// </summary>
        [HttpPut("UpdateTour/{id}")]
        public async Task<ActionResult<TourResponseDto>> UpdateTour(int id, [FromBody] UpdateTourDto updateTourDto)
        {
            try
            {
                if (id != updateTourDto.Id)
                {
                    return BadRequest("ID trong URL không khớp với ID trong body");
                }

                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var tour = await _tourService.UpdateTourAsync(updateTourDto);
                if (tour == null)
                {
                    return NotFound($"Không tìm thấy tour với ID {id}");
                }

                return Ok(tour);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi cập nhật tour với ID {TourId}", id);
                return StatusCode(500, "Có lỗi xảy ra khi cập nhật tour");
            }
        }

        /// <summary>
        /// Xóa tour
        /// </summary>
        [HttpDelete("DeleteTour/{id}")]
        public async Task<ActionResult> DeleteTour(int id)
        {
            try
            {
                var result = await _tourService.DeleteTourAsync(id);
                if (!result)
                {
                    return NotFound($"Không tìm thấy tour với ID {id}");
                }

                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xóa tour với ID {TourId}", id);
                return StatusCode(500, "Có lỗi xảy ra khi xóa tour");
            }
        }

        /// <summary>
        /// Tìm kiếm tour với các tiêu chí
        /// </summary>
        [HttpGet("SearchTours")]
        public async Task<ActionResult<object>> SearchTours([FromQuery] TourSearchDto searchDto)
        {
            try
            {
                var (tours, totalCount) = await _tourService.SearchToursAsync(searchDto);
                
                var result = new
                {
                    Tours = tours,
                    TotalCount = totalCount,
                    Page = searchDto.Page,
                    PageSize = searchDto.PageSize,
                    TotalPages = (int)Math.Ceiling((double)totalCount / searchDto.PageSize)
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tìm kiếm tour");
                return StatusCode(500, "Có lỗi xảy ra khi tìm kiếm tour");
            }
        }

        /// <summary>
        /// Lấy tour theo Host ID
        /// </summary>
        [HttpGet("GetToursByHost/{hostId}")]
        public async Task<ActionResult<IEnumerable<TourResponseDto>>> GetToursByHostId(int hostId)
        {
            try
            {
                var tours = await _tourService.GetToursByHostIdAsync(hostId);
                return Ok(tours);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy tour theo Host ID {HostId}", hostId);
                return StatusCode(500, "Có lỗi xảy ra khi lấy tour theo host");
            }
        }

        /// <summary>
        /// Lấy danh sách tour có sẵn (còn chỗ trống và chưa bắt đầu)
        /// </summary>
        [HttpGet("GetAvailableTours")]
        public async Task<ActionResult<IEnumerable<TourResponseDto>>> GetAvailableTours()
        {
            try
            {
                var tours = await _tourService.GetAvailableToursAsync();
                return Ok(tours);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy danh sách tour có sẵn");
                return StatusCode(500, "Có lỗi xảy ra khi lấy danh sách tour có sẵn");
            }
        }

        /// <summary>
        /// Kiểm tra tour có tồn tại không
        /// </summary>
        [HttpGet("CheckTourExists/{id}")]
        public async Task<ActionResult<bool>> TourExists(int id)
        {
            try
            {
                var exists = await _tourService.TourExistsAsync(id);
                return Ok(exists);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi kiểm tra tour tồn tại với ID {TourId}", id);
                return StatusCode(500, "Có lỗi xảy ra khi kiểm tra tour");
            }
        }
    }
}
