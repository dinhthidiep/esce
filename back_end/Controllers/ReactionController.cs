using ESCE_SYSTEM.Models;
using ESCE_SYSTEM.Services.UserContextService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace ESCE_SYSTEM.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ReactionController : ControllerBase
    {
        private readonly ESCEContext _dbContext;
        private readonly IUserContextService _userContextService;

        public ReactionController(ESCEContext dbContext, IUserContextService userContextService)
        {
            _dbContext = dbContext;
            _userContextService = userContextService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateOrUpdate([FromBody] ReactionDto reactionDto)
        {
            try
            {
                if (!int.TryParse(_userContextService.UserId, out int userId))
                {
                    return Unauthorized(new { message = "User ID không hợp lệ." });
                }

                if (string.IsNullOrWhiteSpace(reactionDto.TargetType) || reactionDto.TargetId <= 0 || string.IsNullOrWhiteSpace(reactionDto.ReactionType))
                {
                    return BadRequest(new { message = "Thông tin reaction không hợp lệ." });
                }

                // Check if user already has a reaction for this target
                var existingReaction = await _dbContext.Reactions
                    .FirstOrDefaultAsync(r => r.UserId == userId 
                        && r.TargetType == reactionDto.TargetType 
                        && r.TargetId == reactionDto.TargetId);

                if (existingReaction != null)
                {
                    // Update existing reaction
                    existingReaction.ReactionType = reactionDto.ReactionType;
                    existingReaction.CreatedAt = DateTime.UtcNow;
                }
                else
                {
                    // Create new reaction
                    var newReaction = new Reaction
                    {
                        UserId = userId,
                        TargetType = reactionDto.TargetType,
                        TargetId = reactionDto.TargetId,
                        ReactionType = reactionDto.ReactionType,
                        CreatedAt = DateTime.UtcNow
                    };
                    _dbContext.Reactions.Add(newReaction);
                }

                await _dbContext.SaveChangesAsync();
                return Ok(new { message = "Reaction đã được cập nhật." });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating/updating reaction: {ex.Message}");
                return StatusCode(500, new { message = "Có lỗi xảy ra khi tạo/cập nhật reaction.", error = ex.Message });
            }
        }

        [HttpDelete("{targetType}/{targetId}")]
        public async Task<IActionResult> Delete(string targetType, int targetId)
        {
            try
            {
                if (!int.TryParse(_userContextService.UserId, out int userId))
                {
                    return Unauthorized(new { message = "User ID không hợp lệ." });
                }

                var reaction = await _dbContext.Reactions
                    .FirstOrDefaultAsync(r => r.UserId == userId 
                        && r.TargetType == targetType 
                        && r.TargetId == targetId);

                if (reaction == null)
                {
                    return NotFound(new { message = "Không tìm thấy reaction để xóa." });
                }

                _dbContext.Reactions.Remove(reaction);
                await _dbContext.SaveChangesAsync();

                return Ok(new { message = "Reaction đã được xóa." });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deleting reaction: {ex.Message}");
                return StatusCode(500, new { message = "Có lỗi xảy ra khi xóa reaction.", error = ex.Message });
            }
        }
    }

    public class ReactionDto
    {
        public string? TargetType { get; set; }
        public int TargetId { get; set; }
        public string? ReactionType { get; set; }
    }
}

