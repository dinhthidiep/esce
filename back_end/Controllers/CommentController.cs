using ESCE_SYSTEM.DTOs.Post;
using ESCE_SYSTEM.Models;
using ESCE_SYSTEM.Repositories.PostCommentRepository;
using ESCE_SYSTEM.Services.UserContextService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ESCE_SYSTEM.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CommentController : ControllerBase
    {
        private readonly IPostCommentRepository _commentRepository;
        private readonly ESCEContext _dbContext;
        private readonly IUserContextService _userContextService;

        public CommentController(
            IPostCommentRepository commentRepository,
            ESCEContext dbContext,
            IUserContextService userContextService)
        {
            _commentRepository = commentRepository;
            _dbContext = dbContext;
            _userContextService = userContextService;
        }

        [HttpGet("post/{postId}")]
        public async Task<IActionResult> GetCommentsByPostId(int postId)
        {
            try
            {
                // Get all comments for this post (both top-level and replies)
                // Don't use Include to avoid circular reference issues with Role.Accounts
                // We'll fetch author info separately
                var allComments = await _dbContext.Comments
                    .Where(c => c.PostId == postId)
                    .OrderBy(c => c.CreatedAt)
                    .ToListAsync();

                // Get current user ID for reactions
                int? currentUserId = null;
                if (int.TryParse(_userContextService.UserId, out int userId))
                {
                    currentUserId = userId;
                }

                // Get all comment IDs
                var commentIds = allComments.Select(c => c.Id).ToList();

                // Get reaction counts for comments
                var reactionCounts = commentIds.Any()
                    ? await _dbContext.Reactions
                        .Where(r => r.TargetType == "COMMENT" && commentIds.Contains(r.TargetId))
                        .GroupBy(r => r.TargetId)
                        .Select(g => new { CommentId = g.Key, Count = g.Count() })
                        .ToDictionaryAsync(x => x.CommentId, x => x.Count)
                    : new Dictionary<int, int>();

                // Get reaction counts by type
                var reactionCountsByTypeDict = new Dictionary<int, Dictionary<string, int>>();
                if (commentIds.Any())
                {
                    var reactionCountsByTypeList = await _dbContext.Reactions
                        .Where(r => r.TargetType == "COMMENT" && commentIds.Contains(r.TargetId))
                        .GroupBy(r => new { r.TargetId, r.ReactionType })
                        .Select(g => new { CommentId = g.Key.TargetId, ReactionType = g.Key.ReactionType, Count = g.Count() })
                        .ToListAsync();

                    reactionCountsByTypeDict = reactionCountsByTypeList
                        .GroupBy(r => r.CommentId)
                        .ToDictionary(
                            g => g.Key,
                            g => g.ToDictionary(r => r.ReactionType, r => r.Count)
                        );
                }

                // Get current user's reactions
                var currentUserReactions = new Dictionary<int, string>();
                if (currentUserId.HasValue && commentIds.Any())
                {
                    var userReactions = await _dbContext.Reactions
                        .Where(r => r.TargetType == "COMMENT" && commentIds.Contains(r.TargetId) && r.UserId == currentUserId.Value)
                        .Select(r => new { r.TargetId, r.ReactionType })
                        .ToListAsync();

                    // Group by TargetId and take the first reaction if there are duplicates
                    // (shouldn't happen, but handle it gracefully)
                    currentUserReactions = userReactions
                        .GroupBy(r => r.TargetId)
                        .ToDictionary(g => g.Key, g => g.First().ReactionType);
                }

                // Get author avatars
                var authorIds = allComments.Select(c => c.AuthorId).Distinct().ToList();
                
                // Fetch author names and avatars separately to avoid circular reference issues
                var authorNames = new Dictionary<int, string>();
                var authorAvatars = new Dictionary<int, string?>();
                
                if (authorIds.Any())
                {
                    var authorInfoList = await _dbContext.Accounts
                        .Where(a => authorIds.Contains(a.Id))
                        .Select(a => new { a.Id, a.Name, a.Avatar })
                        .ToListAsync();
                    
                    foreach (var author in authorInfoList)
                    {
                        authorNames[author.Id] = author.Name ?? "Unknown";
                        authorAvatars[author.Id] = author.Avatar;
                    }
                }

                // Helper function to convert Comment to CommentResponseDto
                Func<Comment, CommentResponseDto> toDto = (comment) => new CommentResponseDto
                {
                    Id = comment.Id,
                    PostId = comment.PostId,
                    AuthorId = comment.AuthorId,
                    AuthorName = authorNames.ContainsKey(comment.AuthorId) ? authorNames[comment.AuthorId] : "Unknown",
                    AuthorAvatar = authorAvatars.ContainsKey(comment.AuthorId) ? authorAvatars[comment.AuthorId] : null,
                    Content = comment.Content ?? string.Empty,
                    Image = string.IsNullOrWhiteSpace(comment.Image) ? null : comment.Image,
                    CreatedAt = comment.CreatedAt,
                    ParentCommentId = comment.ParentCommentId,
                    ReactionsCount = reactionCounts.GetValueOrDefault(comment.Id, 0),
                    ReactionCounts = reactionCountsByTypeDict.ContainsKey(comment.Id)
                        ? reactionCountsByTypeDict[comment.Id]
                        : new Dictionary<string, int>(),
                    CurrentUserReaction = currentUserReactions.ContainsKey(comment.Id)
                        ? currentUserReactions[comment.Id]
                        : null,
                    Replies = new List<CommentResponseDto>() // Explicitly initialize Replies list
                };

                // Build a dictionary of all comments by ID for quick lookup
                // Group by ID first to handle any duplicates (shouldn't happen, but handle gracefully)
                var commentsDict = allComments
                    .GroupBy(c => c.Id)
                    .ToDictionary(g => g.Key, g => toDto(g.First()));

                // Attach replies to their parent comments
                // Allow replies to replies - they will be nested but visually all at 1 indent level
                foreach (var comment in allComments.Where(c => c.ParentCommentId != null))
                {
                    var parentId = comment.ParentCommentId!.Value; // Safe because we filtered for non-null
                    // Attach if parent exists (can be top-level or a reply)
                    if (commentsDict.ContainsKey(parentId))
                    {
                        var replyDto = commentsDict[comment.Id];
                        // Add to parent's Replies list (whether parent is top-level or a reply)
                        commentsDict[parentId].Replies.Add(replyDto);
                    }
                }

                // Build nested structure: only top-level comments (ParentCommentId == null)
                // Use commentsDict to ensure we get the same objects with replies attached
                var topLevelComments = allComments
                    .Where(c => c.ParentCommentId == null)
                    .Select(c => commentsDict[c.Id])
                    .ToList();

                // Sort replies by CreatedAt (recursively for nested replies)
                Action<CommentResponseDto>? sortReplies = null;
                sortReplies = (comment) =>
                {
                    if (comment.Replies != null && comment.Replies.Any())
                    {
                        comment.Replies = comment.Replies.OrderBy(r => r.CreatedAt ?? DateTime.MinValue).ToList();
                        // Recursively sort nested replies
                        foreach (var reply in comment.Replies)
                        {
                            sortReplies?.Invoke(reply);
                        }
                    }
                };

                foreach (var comment in topLevelComments)
                {
                    sortReplies(comment);
                }

                return Ok(topLevelComments);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting comments: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
                }
                return StatusCode(500, new { message = "An error occurred while fetching comments", error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CommentDto commentDto)
        {
            try
            {
                if (!int.TryParse(_userContextService.UserId, out int authorId))
                {
                    return Unauthorized(new { message = "User ID không hợp lệ." });
                }

                if (string.IsNullOrWhiteSpace(commentDto.Content))
                {
                    return BadRequest(new { message = "Content is required" });
                }

                var newComment = new Comment
                {
                    PostId = commentDto.PostId,
                    AuthorId = authorId,
                    ParentCommentId = commentDto.ParentCommentId,
                    Content = commentDto.Content,
                    Image = commentDto.Image,
                    CreatedAt = DateTime.UtcNow
                };

                await _commentRepository.AddAsync(newComment);

                // Return the created comment - don't use Include to avoid circular reference
                var comment = await _dbContext.Comments
                    .FirstOrDefaultAsync(c => c.Id == newComment.Id);

                if (comment == null)
                {
                    return NotFound("Comment not found after creation");
                }

                var authorInfo = await _dbContext.Accounts
                    .Where(a => a.Id == authorId)
                    .Select(a => new { a.Name, a.Avatar })
                    .FirstOrDefaultAsync();

                var result = new CommentResponseDto
                {
                    Id = comment.Id,
                    PostId = comment.PostId,
                    AuthorId = comment.AuthorId,
                    AuthorName = authorInfo?.Name ?? "Unknown",
                    AuthorAvatar = authorInfo?.Avatar,
                    Content = comment.Content,
                    Image = comment.Image,
                    CreatedAt = comment.CreatedAt,
                    ReactionsCount = 0,
                    ReactionCounts = new Dictionary<string, int>(),
                    CurrentUserReaction = null
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating comment: {ex.Message}");
                return StatusCode(500, new { message = "An error occurred while creating comment", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                Console.WriteLine($"DELETE /api/Comment/{id} endpoint called");
                
                if (!int.TryParse(_userContextService.UserId, out int currentUserId))
                {
                    Console.WriteLine($"Invalid user ID: {_userContextService.UserId}");
                    return Unauthorized(new { message = "User ID không hợp lệ." });
                }

                Console.WriteLine($"Current user ID: {currentUserId}, Deleting comment ID: {id}");

                var comment = await _commentRepository.GetByIdAsync(id);
                if (comment == null)
                {
                    Console.WriteLine($"Comment with ID {id} not found in database");
                    return NotFound(new { message = "Comment not found." });
                }

                Console.WriteLine($"Comment found: ID={comment.Id}, AuthorId={comment.AuthorId}, PostId={comment.PostId}");

                // Check if current user is the author
                if (comment.AuthorId != currentUserId)
                {
                    Console.WriteLine($"User {currentUserId} is not the author (AuthorId: {comment.AuthorId})");
                    return StatusCode(403, new { message = "Bạn không có quyền xóa bình luận này." });
                }

                // Delete all reactions on this comment first
                var reactions = await _dbContext.Reactions
                    .Where(r => r.TargetType == "COMMENT" && r.TargetId == id)
                    .ToListAsync();
                
                if (reactions.Any())
                {
                    _dbContext.Reactions.RemoveRange(reactions);
                    await _dbContext.SaveChangesAsync();
                }

                // Delete all replies to this comment (recursively)
                // Use a transaction to ensure all deletions succeed
                using (var transaction = await _dbContext.Database.BeginTransactionAsync())
                {
                    try
                    {
                        // Declare the recursive function first
                        Func<int, Task>? deleteReplies = null;
                        deleteReplies = async (parentCommentId) =>
                        {
                            var replies = await _dbContext.Comments
                                .Where(c => c.ParentCommentId == parentCommentId)
                                .ToListAsync();
                            
                            foreach (var reply in replies)
                            {
                                // Delete reactions on reply first
                                var replyReactions = await _dbContext.Reactions
                                    .Where(r => r.TargetType == "COMMENT" && r.TargetId == reply.Id)
                                    .ToListAsync();
                                
                                if (replyReactions.Any())
                                {
                                    _dbContext.Reactions.RemoveRange(replyReactions);
                                    await _dbContext.SaveChangesAsync();
                                }
                                
                                // Recursively delete nested replies
                                if (deleteReplies != null)
                                {
                                    await deleteReplies(reply.Id);
                                }
                            }
                            
                            if (replies.Any())
                            {
                                _dbContext.Comments.RemoveRange(replies);
                                await _dbContext.SaveChangesAsync();
                            }
                        };

                        // Delete all nested replies first
                        if (deleteReplies != null)
                        {
                            await deleteReplies(id);
                        }
                        
                        // Commit the transaction
                        await transaction.CommitAsync();
                    }
                    catch (Exception ex)
                    {
                        await transaction.RollbackAsync();
                        Console.WriteLine($"Error deleting replies: {ex.Message}");
                        throw;
                    }
                }

                // Now delete the comment itself
                await _commentRepository.DeleteAsync(comment);

                return Ok(new { message = "Comment deleted successfully" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deleting comment: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
                }
                return StatusCode(500, new { message = "An error occurred while deleting comment", error = ex.Message });
            }
        }
    }

    public class CommentDto
    {
        public int PostId { get; set; }
        public int? ParentCommentId { get; set; }
        public string Content { get; set; } = null!;
        public string? Image { get; set; }
    }
}

