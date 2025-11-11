using ESCE_SYSTEM.DTOs.Post;
using ESCE_SYSTEM.Services.PostService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ESCE_SYSTEM.Controllers
{
    [Route("api/tour")]
    [ApiController]
    public class TourController : ControllerBase
    {
        private readonly IPostService _postService;

        public TourController(IPostService postService)
        {
            _postService = postService;
        }

        [HttpPost("create-tour")]
        public async Task<IActionResult> CreateTour([FromForm] CreateTourDto createTourDto)
        {
            try
            {
                var tourId = await _postService.CreateTourAsync(createTourDto);
                return Ok(new { message = "Tour created successfully", tourId });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("create-tour-combo")]
        public async Task<IActionResult> CreateTourCombo([FromBody] CreateTourComboDto createTourComboDto)
        {
            try
            {
                var tourComboId = await _postService.CreateTourComboAsync(createTourComboDto);
                return Ok(new { message = "Tour combo created successfully", tourComboId });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("tours")]
        public async Task<IActionResult> GetAllTours()
        {
            try
            {
                var tours = await _postService.GetAllToursAsync();
                return Ok(tours);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("tour-combos")]
        public async Task<IActionResult> GetAllTourCombos([FromQuery] TourComboSearchDto searchDto)
        {
            try
            {
                var result = await _postService.SearchTourCombosAsync(searchDto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("tour-combo/{id}")]
        public async Task<IActionResult> GetTourComboById(int id)
        {
            try
            {
                var tourCombo = await _postService.GetTourComboByIdAsync(id);

                if (tourCombo == null)
                {
                    return NotFound(new { message = "Tour combo not found" });
                }

                return Ok(tourCombo);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("create-coupon")]
        public async Task<IActionResult> CreateCoupon([FromBody] CreateCouponDto createCouponDto)
        {
            try
            {
                var couponId = await _postService.CreateCouponAsync(createCouponDto);
                return Ok(new { message = "Coupon created successfully", couponId });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("coupons")]
        public async Task<IActionResult> GetAllCoupons()
        {
            try
            {
                var coupons = await _postService.GetAllCouponsAsync();
                return Ok(coupons);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // Social Media endpoints
        [HttpPost("create-post")]
        public async Task<IActionResult> CreatePost([FromBody] CreatePostDto createPostDto)
        {
            try
            {
                var postId = await _postService.CreateSocialPostAsync(createPostDto);
                return Ok(new { message = "Post created successfully", postId });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("posts")]
        public async Task<IActionResult> GetAllPosts()
        {
            try
            {
                var posts = await _postService.GetAllSocialPostsAsync();
                return Ok(posts);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("create-comment")]
        public async Task<IActionResult> CreateComment([FromBody] CreateCommentDto createCommentDto)
        {
            try
            {
                var commentId = await _postService.CreateCommentAsync(createCommentDto);
                return Ok(new { message = "Comment created successfully", commentId });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("create-reaction")]
        public async Task<IActionResult> CreateReaction([FromBody] CreateReactionDto createReactionDto)
        {
            try
            {
                var reactionId = await _postService.CreateReactionAsync(createReactionDto);
                return Ok(new { message = "Reaction created successfully", reactionId });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
