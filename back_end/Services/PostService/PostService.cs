using ESCE_SYSTEM.DTOs;
using ESCE_SYSTEM.DTOs.Post;
using ESCE_SYSTEM.Models;
using ESCE_SYSTEM.Repositories.PostRepository;
using ESCE_SYSTEM.Services.UserContextService;
using Mapster;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ESCE_SYSTEM.Services.PostService
{
    public class PostService : IPostService
    {
        private readonly IPostRepository _postRepository;
        private readonly IUserContextService _userContextService;
        private readonly ESCEContext _dbContext;

        public PostService(IPostRepository postRepository, IUserContextService userContextService, ESCEContext dbContext)
        {
            _postRepository = postRepository;
            _userContextService = userContextService;
            _dbContext = dbContext;
        }

        public async Task<Post> CreateAsync(PostDto postDto)
        {
            if (!int.TryParse(_userContextService.UserId, out int authorId))
                throw new UnauthorizedAccessException("User ID không hợp lệ.");

            var newPost = postDto.Adapt<Post>();
            newPost.AuthorId = authorId;
            newPost.CreatedAt = DateTime.UtcNow;
            newPost.UpdatedAt = DateTime.UtcNow;
            newPost.Image = postDto.Image ?? null;
            // Cần thêm logic gán Status = "Pending" nếu Model Post có trường Status

            await _postRepository.AddAsync(newPost);
            return newPost;
        }

        public async Task DeleteAsync(int id)
        {
            Console.WriteLine($"DeleteAsync called with post ID: {id}");
            var post = await _postRepository.GetByIdAsync(id);
            if (post == null)
            {
                Console.WriteLine($"Post with ID {id} not found in database");
                throw new Exception("Post not found.");
            }
            
            Console.WriteLine($"Post found: ID={post.Id}, AuthorId={post.AuthorId}");
            
            // Check if current user is the author
            if (!int.TryParse(_userContextService.UserId, out int currentUserId))
            {
                Console.WriteLine($"Invalid user ID from context: {_userContextService.UserId}");
                throw new UnauthorizedAccessException("User ID không hợp lệ.");
            }
            
            Console.WriteLine($"Current user ID: {currentUserId}, Post AuthorId: {post.AuthorId}");
            
            if (post.AuthorId != currentUserId)
            {
                throw new UnauthorizedAccessException("Bạn không có quyền xóa bài đăng này.");
            }
            
            // Delete all related records first (due to foreign key constraints)
            // Use a transaction to ensure all deletions succeed or none do
            using (var transaction = await _dbContext.Database.BeginTransactionAsync())
            {
                try
                {
                    Console.WriteLine($"Deleting related records for post {id}...");
                    
                    // Get comment IDs first
                    var commentIds = await _dbContext.Comments
                        .Where(c => c.PostId == id)
                        .Select(c => c.Id)
                        .ToListAsync();
                    Console.WriteLine($"Found {commentIds.Count} comments to delete");
                    
                    // Delete all reactions on comments for this post
                    if (commentIds.Any())
                    {
                        var commentReactions = await _dbContext.Reactions
                            .Where(r => r.TargetType == "Comment" && commentIds.Contains(r.TargetId))
                            .ToListAsync();
                        Console.WriteLine($"Found {commentReactions.Count} reactions on comments to delete");
                        if (commentReactions.Any())
                        {
                            _dbContext.Reactions.RemoveRange(commentReactions);
                            Console.WriteLine($"Removed {commentReactions.Count} reactions on comments from context");
                        }
                    }
                    
                    // Delete all comments for this post (including nested replies)
                    var comments = await _dbContext.Comments
                        .Where(c => c.PostId == id)
                        .ToListAsync();
                    if (comments.Any())
                    {
                        _dbContext.Comments.RemoveRange(comments);
                        Console.WriteLine($"Removed {comments.Count} comments from context");
                    }
                    
                    // Delete all reactions for this post (where TargetType = "Post" and TargetId = postId)
                    var postReactions = await _dbContext.Reactions
                        .Where(r => r.TargetType == "Post" && r.TargetId == id)
                        .ToListAsync();
                    Console.WriteLine($"Found {postReactions.Count} reactions on post to delete");
                    if (postReactions.Any())
                    {
                        _dbContext.Reactions.RemoveRange(postReactions);
                        Console.WriteLine($"Removed {postReactions.Count} reactions on post from context");
                    }
                    
                    // Delete all PostSave records for this post
                    try
                    {
                        var postSaves = await _dbContext.Set<PostSave>()
                            .Where(ps => ps.PostId == id)
                            .ToListAsync();
                        Console.WriteLine($"Found {postSaves.Count} post saves to delete");
                        if (postSaves.Any())
                        {
                            _dbContext.Set<PostSave>().RemoveRange(postSaves);
                            Console.WriteLine($"Removed {postSaves.Count} post saves from context");
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error querying post saves (table may not exist): {ex.Message}");
                        // Continue - PostSave might not exist in the database
                    }
                    
                    // Save all related deletions first
                    await _dbContext.SaveChangesAsync();
                    Console.WriteLine("All related records deleted successfully");
                    
                    // Now delete the post itself - detach it first to avoid tracking issues
                    _dbContext.Entry(post).State = Microsoft.EntityFrameworkCore.EntityState.Detached;
                    var postToDelete = await _dbContext.Posts.FindAsync(id);
                    if (postToDelete != null)
                    {
                        _dbContext.Posts.Remove(postToDelete);
                        await _dbContext.SaveChangesAsync();
                        Console.WriteLine($"Post {id} deleted successfully");
                    }
                    else
                    {
                        Console.WriteLine($"Post {id} not found when trying to delete (may have been deleted already)");
                    }
                    
                    // Commit the transaction
                    await transaction.CommitAsync();
                    Console.WriteLine($"Transaction committed successfully for post {id}");
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    Console.WriteLine($"Error deleting post: {ex.Message}");
                    Console.WriteLine($"Inner exception: {ex.InnerException?.Message}");
                    Console.WriteLine($"Stack trace: {ex.StackTrace}");
                    if (ex.InnerException != null)
                    {
                        Console.WriteLine($"Inner exception type: {ex.InnerException.GetType().Name}");
                        Console.WriteLine($"Inner stack trace: {ex.InnerException.StackTrace}");
                    }
                    throw;
                }
            }
        }

        public async Task UpdateAsync(int id, PostDto postDto)
        {
            var post = await _postRepository.GetByIdAsync(id);
            if (post == null) throw new Exception("Post not found.");

            if (!int.TryParse(_userContextService.UserId, out int currentUserId) || post.AuthorId != currentUserId)
                throw new UnauthorizedAccessException("Bạn không có quyền chỉnh sửa bài viết này.");

            post.Title = postDto.Title;
            post.Content = postDto.Content;
            post.Image = postDto.Image;
            post.UpdatedAt = DateTime.UtcNow;

            await _postRepository.UpdateAsync(post);
        }

        public async Task ApproveAsync(ApprovePostDto approvePostDto)
        {
            var post = await _postRepository.GetByIdAsync(approvePostDto.PostId);
            if (post == null) throw new Exception("Post not found.");

            // post.Status = "Approved"; // Cần thuộc tính Status
            // post.UpdatedAt = DateTime.UtcNow;

            await _postRepository.UpdateAsync(post);
            // Thêm logic gửi thông báo cho tác giả
        }

        public async Task RejectAsync(RejectPostDto rejectPostDto)
        {
            var post = await _postRepository.GetByIdAsync(rejectPostDto.PostId);
            if (post == null) throw new Exception("Post not found.");

            // post.Status = "Rejected"; // Cần thuộc tính Status
            // post.RejectComment = rejectPostDto.Comment; // Cần thuộc tính RejectComment
            // post.UpdatedAt = DateTime.UtcNow;

            await _postRepository.UpdateAsync(post);
            // Thêm logic gửi thông báo cho tác giả
        }

        public Task<Post?> GetByIdAsync(int id) => _postRepository.GetByIdAsync(id);

        // Các phương thức lấy danh sách cần logic lọc (giả định)
        public async Task<List<PostResponseDto>> GetAllPostsAsync()
        {
            try
            {
                // Increase timeout for this specific query to handle large datasets
                _dbContext.Database.SetCommandTimeout(180); // 3 minutes
                
                // Get posts - use AsNoTracking for better performance since we're not modifying these entities
                // Don't use Include to avoid circular reference issues with Role.Accounts
                var posts = await _dbContext.Posts
                    .AsNoTracking()
                    .OrderByDescending(p => p.CreatedAt)
                    .ToListAsync();
                
                if (posts == null || !posts.Any())
                {
                    return new List<PostResponseDto>();
                }

                var postIds = posts.Select(p => p.Id).ToList();

                // Get comment counts per post using database query
                var commentCounts = postIds.Any() 
                    ? await _dbContext.Comments
                        .Where(c => postIds.Contains(c.PostId))
                        .GroupBy(c => c.PostId)
                        .Select(g => new { PostId = g.Key, Count = g.Count() })
                        .ToDictionaryAsync(x => x.PostId, x => x.Count)
                    : new Dictionary<int, int>();

                // Get reaction counts per post using database query
                var reactionCounts = postIds.Any()
                    ? await _dbContext.Reactions
                        .Where(r => r.TargetType == "POST" && postIds.Contains(r.TargetId))
                        .GroupBy(r => r.TargetId)
                        .Select(g => new { PostId = g.Key, Count = g.Count() })
                        .ToDictionaryAsync(x => x.PostId, x => x.Count)
                    : new Dictionary<int, int>();

                // Get reaction counts grouped by type per post
                var reactionCountsByTypeDict = new Dictionary<int, Dictionary<string, int>>();
                
                if (postIds.Any())
                {
                    var reactionCountsByTypeList = await _dbContext.Reactions
                        .Where(r => r.TargetType == "POST" && postIds.Contains(r.TargetId))
                        .GroupBy(r => new { r.TargetId, r.ReactionType })
                        .Select(g => new { PostId = g.Key.TargetId, ReactionType = g.Key.ReactionType, Count = g.Count() })
                        .ToListAsync();

                    reactionCountsByTypeDict = reactionCountsByTypeList
                        .GroupBy(r => r.PostId)
                        .ToDictionary(
                            g => g.Key,
                            g => g.ToDictionary(r => r.ReactionType, r => r.Count)
                        );
                }

                // Get current user's reaction for each post
                var currentUserReactions = new Dictionary<int, string>();
                if (int.TryParse(_userContextService.UserId, out int currentUserId) && postIds.Any())
                {
                    var userReactions = await _dbContext.Reactions
                        .Where(r => r.TargetType == "POST" && postIds.Contains(r.TargetId) && r.UserId == currentUserId)
                        .Select(r => new { r.TargetId, r.ReactionType })
                        .ToListAsync();

                    currentUserReactions = userReactions.ToDictionary(r => r.TargetId, r => r.ReactionType);
                }

                // Get author IDs for all posts
                var authorIds = posts.Select(p => p.AuthorId).Distinct().ToList();
                
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

                return posts.Select(post => new PostResponseDto
                {
                    Id = post.Id,
                    Title = post.Title ?? string.Empty,
                    Content = post.Content ?? string.Empty,
                    AuthorName = authorNames.ContainsKey(post.AuthorId) ? authorNames[post.AuthorId] : "Unknown",
                    AuthorId = post.AuthorId,
                    AuthorAvatar = authorAvatars.ContainsKey(post.AuthorId) ? authorAvatars[post.AuthorId] : null,
                    // Only include Image if it's not too large (limit to reasonable size)
                    // For very large images, consider loading them separately on demand
                    Image = string.IsNullOrWhiteSpace(post.Image) ? null : post.Image,
                    CreatedAt = post.CreatedAt,
                    CommentsCount = commentCounts.GetValueOrDefault(post.Id, 0),
                    ReactionsCount = reactionCounts.GetValueOrDefault(post.Id, 0),
                    ReactionCounts = reactionCountsByTypeDict.ContainsKey(post.Id)
                        ? reactionCountsByTypeDict[post.Id]
                        : new Dictionary<string, int>(),
                    CurrentUserReaction = currentUserReactions.ContainsKey(post.Id)
                        ? currentUserReactions[post.Id]
                        : null
                }).ToList();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetAllPostsAsync: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
                }
                throw;
            }
        }
        public Task<List<Post>> GetAllPostsApprovedAsync() { throw new NotImplementedException(); }
        public Task<List<Post>> GetAllPostsPendingAsync() { throw new NotImplementedException(); }
    }
}