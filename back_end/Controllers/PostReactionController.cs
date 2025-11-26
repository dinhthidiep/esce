using ESCE_SYSTEM.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace ESCE_SYSTEM.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PostReactionController : ControllerBase
    {
        private readonly IPostReactionService _postReactionService;

        public PostReactionController(IPostReactionService postReactionService)
        {
            _postReactionService = postReactionService;
        }

        [HttpPost("like/{postId}")]
        [Authorize(Roles = "Admin,Host,Agency,Customer")]
        public async Task<IActionResult> LikePost(int postId)
        {
            try
            {
                // Sử dụng ToggleLikePost để tự động like/unlike
                var toggleResult = await _postReactionService.ToggleLikePost(postId);
                
                if (toggleResult.IsLiked)
                {
                    return Ok(new { 
                        message = "Đã thích bài viết", 
                        isLiked = true,
                        reaction = toggleResult.Reaction 
                    });
                }
                else
                {
                    return Ok(new { 
                        message = "Đã bỏ thích bài viết", 
                        isLiked = false,
                        reaction = (object?)null 
                    });
                }
            }
            catch (Exception ex)
            {
                // Log chi tiết lỗi để debug
                var errorMessage = ex.Message;
                if (ex.InnerException != null)
                {
                    errorMessage += $" | Chi tiết: {ex.InnerException.Message}";
                }
                
                // Kiểm tra các lỗi database phổ biến
                if (ex.Message.Contains("foreign key") || ex.Message.Contains("FOREIGN KEY"))
                {
                    errorMessage = "Lỗi: Dữ liệu không hợp lệ. Vui lòng thử lại sau.";
                }
                else if (ex.Message.Contains("unique") || ex.Message.Contains("UNIQUE") || ex.Message.Contains("duplicate"))
                {
                    errorMessage = "Bạn đã thích bài viết này rồi.";
                }
                else if (ex.Message.Contains("saving the entity changes"))
                {
                    errorMessage = "Không thể lưu thay đổi. Vui lòng kiểm tra dữ liệu và thử lại.";
                    if (ex.InnerException != null)
                    {
                        errorMessage += $" Chi tiết: {ex.InnerException.Message}";
                    }
                }
                
                return BadRequest(new { message = errorMessage });
            }
        }

        [HttpDelete("unlike/{postReactionId}")]
        [Authorize(Roles = "Admin,Host,Agency,Customer")]
        public async Task<IActionResult> UnlikePost(int postReactionId)
        {
            try
            {
                var postId = await _postReactionService.UnlikePost(postReactionId);
                return Ok(new { message = "Đã bỏ thích bài viết", postReactionId, postId });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid("Bạn không có quyền bỏ lượt thích này");
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("count/{postId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetLikeCount(int postId)
        {
            try
            {
                var count = await _postReactionService.GetLikeCount(postId);
                return Ok(new { postId, likeCount = count });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}