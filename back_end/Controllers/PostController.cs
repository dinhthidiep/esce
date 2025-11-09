using ESCE_SYSTEM.Services.PostService;
using ESCE_SYSTEM.DTOs.Post;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Threading.Tasks;

namespace ESCE_SYSTEM.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PostController : ControllerBase
    {
        private readonly IPostService _postService;

        public PostController(IPostService postService)
        {
            _postService = postService;
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var result = await _postService.GetAllPostsAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting posts: {ex.Message}");
                return StatusCode(500, new { message = "An error occurred while fetching posts", error = ex.Message });
            }
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] PostDto postDto)
        {
            try
            {
                if (postDto == null)
                {
                    return BadRequest(new { message = "Post data is required" });
                }

                if (string.IsNullOrWhiteSpace(postDto.Title))
                {
                    return BadRequest(new { message = "Title is required" });
                }

                if (string.IsNullOrWhiteSpace(postDto.Content))
                {
                    return BadRequest(new { message = "Content is required" });
                }

                var result = await _postService.CreateAsync(postDto);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                Console.WriteLine($"Unauthorized access: {ex.Message}");
                return StatusCode(401, new { message = ex.Message });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating post: {ex.Message}");
                return StatusCode(500, new { message = "An error occurred while creating post", error = ex.Message });
            }
        }

        [HttpDelete("{id:int}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                Console.WriteLine($"=== DELETE /api/Post/{id} endpoint called ===");
                Console.WriteLine($"Request received at: {DateTime.Now}");
                await _postService.DeleteAsync(id);
                Console.WriteLine($"Post {id} deleted successfully from controller");
                return Ok(new { message = "Post deleted successfully" });
            }
            catch (UnauthorizedAccessException ex)
            {
                Console.WriteLine($"Unauthorized delete attempt: {ex.Message}");
                return StatusCode(403, new { message = ex.Message });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deleting post in controller: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                if (ex.Message.Contains("not found") || ex.Message.Contains("Post not found"))
                {
                    return NotFound(new { message = ex.Message });
                }
                return StatusCode(500, new { message = "An error occurred while deleting post", error = ex.Message });
            }
        }
    }
}
