using ESCE_SYSTEM.DTOs;
using ESCE_SYSTEM.Models;
using ESCE_SYSTEM.Repositories;
using ESCE_SYSTEM.Services;
using ESCE_SYSTEM.Services.UserContextService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;

namespace ESCE_SYSTEM.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReactionController : ControllerBase
    {
        private readonly IPostReactionRepository _postReactionRepository;
        private readonly ICommentReactionRepository _commentReactionRepository;
        private readonly IPostRepository _postRepository;
        private readonly ICommentRepository _commentRepository;
        private readonly IUserContextService _userContextService;
        private readonly ESCEContext _context;

        public ReactionController(
            IPostReactionRepository postReactionRepository,
            ICommentReactionRepository commentReactionRepository,
            IPostRepository postRepository,
            ICommentRepository commentRepository,
            IUserContextService userContextService,
            ESCEContext context)
        {
            _postReactionRepository = postReactionRepository;
            _commentReactionRepository = commentReactionRepository;
            _postRepository = postRepository;
            _commentRepository = commentRepository;
            _userContextService = userContextService;
            _context = context;
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Host,Agency,Customer")]
        public async Task<IActionResult> CreateReaction([FromBody] CreateReactionDto dto)
        {
            try
            {
                var currentUserId = _userContextService.GetCurrentUserId();
                
                // Map reaction type string to ReactionTypeId
                // Database mapping: like=1, dislike=2, love=3, haha=4, wow=5
                byte reactionTypeId = dto.ReactionType.ToLower() switch
                {
                    "like" => 1,
                    "dislike" => 2,
                    "love" => 3,
                    "haha" => 4,
                    "wow" => 5,
                    _ => 1 // Default to like
                };

                if (dto.TargetType.ToUpper() == "POST")
                {
                    // Verify Post exists first
                    var postExists = await _postRepository.GetByIdAsync(dto.TargetId);
                    if (postExists == null)
                    {
                        return BadRequest(new { message = $"Post với ID {dto.TargetId} không tồn tại" });
                    }

                    // Check if user already reacted to this post
                    var existingReaction = await _postReactionRepository.GetByUserAndPostAsync(currentUserId, dto.TargetId);
                    if (existingReaction != null)
                    {
                        // If same reaction type, delete it (toggle off)
                        if (existingReaction.ReactionTypeId == reactionTypeId)
                        {
                            await _postReactionRepository.DeleteAsync(existingReaction.Id);
                            
                            // Update reaction count
                            var post = await _postRepository.GetByIdAsync(dto.TargetId);
                            if (post != null && post.ReactionsCount > 0)
                            {
                                post.ReactionsCount--;
                                await _postRepository.UpdateAsync(post);
                            }
                            
                            return Ok(new { message = "Đã bỏ reaction", deleted = true });
                        }
                        else
                        {
                            // Update existing reaction to new type
                            existingReaction.ReactionTypeId = reactionTypeId;
                            existingReaction.CreatedAt = DateTime.Now;
                            _context.Postreactions.Update(existingReaction);
                            await _context.SaveChangesAsync();
                            return Ok(new { message = "Đã cập nhật reaction", updated = true });
                        }
                    }

                    // Verify ReactionType exists (optional check, but helpful)
                    var reactionTypeExists = await _context.Set<ReactionType>().FirstOrDefaultAsync(rt => rt.Id == reactionTypeId);
                    if (reactionTypeExists == null)
                    {
                        return BadRequest(new { message = $"ReactionType với ID {reactionTypeId} không tồn tại" });
                    }

                    // Log before creating reaction
                    Console.WriteLine($"Creating reaction - UserId: {currentUserId}, PostId: {dto.TargetId}, ReactionTypeId: {reactionTypeId}");

                    // Create new reaction
                    var postReaction = new Postreaction
                    {
                        UserId = currentUserId,
                        PostId = dto.TargetId,
                        ReactionTypeId = reactionTypeId,
                        CreatedAt = DateTime.Now
                    };

                    await _postReactionRepository.AddAsync(postReaction);

                    // Update reaction count
                    var postToUpdate = await _postRepository.GetByIdAsync(dto.TargetId);
                    if (postToUpdate != null)
                    {
                        postToUpdate.ReactionsCount++;
                        await _postRepository.UpdateAsync(postToUpdate);
                    }

                    return Ok(new { message = "Đã tạo reaction", created = true });
                }
                else if (dto.TargetType.ToUpper() == "COMMENT")
                {
                    // Check if user already reacted to this comment
                    var existingReaction = await _commentReactionRepository.GetByUserAndCommentAsync(currentUserId, dto.TargetId);
                    if (existingReaction != null)
                    {
                        // If same reaction type, delete it (toggle off)
                        if (existingReaction.ReactionTypeId == reactionTypeId)
                        {
                            await _commentReactionRepository.DeleteAsync(existingReaction.Id);
                            
                            // Update reaction count
                            var comment = await _commentRepository.GetByIdAsync(dto.TargetId);
                            if (comment != null && comment.ReactionsCount > 0)
                            {
                                comment.ReactionsCount--;
                                await _commentRepository.UpdateAsync(comment);
                            }
                            
                            return Ok(new { message = "Đã bỏ reaction", deleted = true });
                        }
                        else
                        {
                            // Update existing reaction to new type
                            existingReaction.ReactionTypeId = reactionTypeId;
                            existingReaction.CreatedAt = DateTime.Now;
                            _context.Commentreactions.Update(existingReaction);
                            await _context.SaveChangesAsync();
                            return Ok(new { message = "Đã cập nhật reaction", updated = true });
                        }
                    }

                    // Create new reaction
                    var commentReaction = new Commentreaction
                    {
                        UserId = currentUserId,
                        CommentId = dto.TargetId,
                        ReactionTypeId = reactionTypeId,
                        CreatedAt = DateTime.Now
                    };

                    await _commentReactionRepository.AddAsync(commentReaction);

                    // Update reaction count
                    var commentToUpdate = await _commentRepository.GetByIdAsync(dto.TargetId);
                    if (commentToUpdate != null)
                    {
                        commentToUpdate.ReactionsCount++;
                        await _commentRepository.UpdateAsync(commentToUpdate);
                    }

                    return Ok(new { message = "Đã tạo reaction", created = true });
                }
                else
                {
                    return BadRequest(new { message = "TargetType phải là 'POST' hoặc 'COMMENT'" });
                }
            }
            catch (DbUpdateException dbEx)
            {
                // Handle database-specific errors - extract the innermost exception
                var innerEx = dbEx;
                while (innerEx.InnerException != null)
                {
                    innerEx = (DbUpdateException)innerEx.InnerException ?? innerEx;
                }
                
                var errorMessage = innerEx.Message ?? dbEx.Message;
                
                // Log to console for debugging
                Console.WriteLine($"=== Database error creating reaction ===");
                Console.WriteLine($"Outer exception: {dbEx.Message}");
                Console.WriteLine($"Inner exception: {dbEx.InnerException?.Message}");
                Console.WriteLine($"Innermost exception: {errorMessage}");
                Console.WriteLine($"Stack trace: {dbEx.StackTrace}");
                if (dbEx.InnerException != null)
                {
                    Console.WriteLine($"Inner stack trace: {dbEx.InnerException.StackTrace}");
                }
                
                // Check for common database errors
                var lowerError = errorMessage.ToLower();
                if (lowerError.Contains("unique") || lowerError.Contains("duplicate") || lowerError.Contains("cannot insert duplicate key") || lowerError.Contains("violation of unique key"))
                {
                    return BadRequest(new { message = "Bạn đã reaction bài viết này rồi" });
                }
                if (lowerError.Contains("foreign key") || lowerError.Contains("constraint") || lowerError.Contains("the insert statement conflicted") || lowerError.Contains("the delete statement conflicted"))
                {
                    return BadRequest(new { message = "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại PostId, UserId hoặc ReactionTypeId" });
                }
                
                return BadRequest(new { message = $"Lỗi database: {errorMessage}" });
            }
            catch (Exception ex)
            {
                // Log the full exception details including inner exception
                var errorMessage = ex.Message;
                if (ex.InnerException != null)
                {
                    errorMessage += $" Inner: {ex.InnerException.Message}";
                }
                
                // Log to console for debugging
                Console.WriteLine($"Error creating reaction: {errorMessage}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                
                return BadRequest(new { message = errorMessage });
            }
        }

        [HttpDelete]
        [Authorize(Roles = "Admin,Host,Agency,Customer")]
        public async Task<IActionResult> DeleteReaction([FromQuery] string targetType, [FromQuery] int targetId)
        {
            try
            {
                var currentUserId = _userContextService.GetCurrentUserId();

                if (targetType.ToUpper() == "POST")
                {
                    var existingReaction = await _postReactionRepository.GetByUserAndPostAsync(currentUserId, targetId);
                    if (existingReaction == null)
                    {
                        return NotFound(new { message = "Không tìm thấy reaction" });
                    }

                    await _postReactionRepository.DeleteAsync(existingReaction.Id);

                    // Update reaction count
                    var post = await _postRepository.GetByIdAsync(targetId);
                    if (post != null && post.ReactionsCount > 0)
                    {
                        post.ReactionsCount--;
                        await _postRepository.UpdateAsync(post);
                    }

                    return Ok(new { message = "Đã xóa reaction" });
                }
                else if (targetType.ToUpper() == "COMMENT")
                {
                    var existingReaction = await _commentReactionRepository.GetByUserAndCommentAsync(currentUserId, targetId);
                    if (existingReaction == null)
                    {
                        return NotFound(new { message = "Không tìm thấy reaction" });
                    }

                    await _commentReactionRepository.DeleteAsync(existingReaction.Id);

                    // Update reaction count
                    var comment = await _commentRepository.GetByIdAsync(targetId);
                    if (comment != null && comment.ReactionsCount > 0)
                    {
                        comment.ReactionsCount--;
                        await _commentRepository.UpdateAsync(comment);
                    }

                    return Ok(new { message = "Đã xóa reaction" });
                }
                else
                {
                    return BadRequest(new { message = "TargetType phải là 'POST' hoặc 'COMMENT'" });
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}

