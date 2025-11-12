using ESCE_SYSTEM.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ESCE_SYSTEM.Repositories
{
    public class PostRepository : IPostRepository
    {
        private readonly ESCEContext _context;

        public PostRepository(ESCEContext context)
        {
            _context = context;
        }

        public async Task<Post> GetByIdAsync(int id)
        {
            return await _context.Posts
                .Include(p => p.Author)
                .ThenInclude(a => a.Role)
                .Include(p => p.Comments.Where(c => !c.IsDeleted))
                .ThenInclude(c => c.Author)
                .Include(p => p.Postreactions)
                .ThenInclude(pr => pr.User)
                .Include(p => p.Postsaves)
                .ThenInclude(ps => ps.Account)
                .FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted);
        }

        public async Task<IEnumerable<Post>> GetAllAsync()
        {
            try
            {
                Console.WriteLine($"[PostRepository] GetAllAsync: Starting at {DateTime.Now}");
                
                // Filter in database and limit to prevent timeout
                // Get only the most recent 50 posts to improve performance
                var posts = await _context.Posts
                    .Where(p => !p.IsDeleted)
                    .OrderByDescending(p => p.CreatedAt)
                    .Take(50) // Limit to 50 most recent posts
                    .ToListAsync();
                
                Console.WriteLine($"[PostRepository] GetAllAsync: Loaded {posts.Count} posts at {DateTime.Now}");

                if (!posts.Any())
                {
                    return posts;
                }

                // Load related data separately to avoid complex joins
                var authorIds = posts.Select(p => p.AuthorId).Distinct().ToList();
                var authors = new List<Account>();
                if (authorIds.Any())
                {
                    try
                    {
                        authors = await _context.Accounts
                            .Where(a => authorIds.Contains(a.Id))
                            .Include(a => a.Role)
                            .ToListAsync();
                    }
                    catch (Exception ex)
                    {
                        System.Diagnostics.Debug.WriteLine($"Error loading authors: {ex.Message}");
                        // Continue without authors if this fails
                    }
                }

                var postIds = posts.Select(p => p.Id).ToList();
                Console.WriteLine($"[PostRepository] GetAllAsync: Loading comments for {postIds.Count} posts at {DateTime.Now}");
                
                var comments = new List<Comment>();
                try
                {
                    comments = await _context.Comments
                        .Where(c => postIds.Contains(c.PostId) && !c.IsDeleted)
                        .Include(c => c.Author)
                        .AsNoTracking() // Improve performance
                        .ToListAsync();
                    Console.WriteLine($"[PostRepository] GetAllAsync: Loaded {comments.Count} comments at {DateTime.Now}");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[PostRepository] GetAllAsync: Error loading comments: {ex.Message}");
                    // Continue without comments if this fails
                }

                Console.WriteLine($"[PostRepository] GetAllAsync: Loading reactions for {postIds.Count} posts at {DateTime.Now}");
                var postreactions = new List<Postreaction>();
                try
                {
                    postreactions = await _context.Postreactions
                        .Where(pr => postIds.Contains(pr.PostId))
                        .Include(pr => pr.User)
                        .AsNoTracking() // Improve performance
                        .ToListAsync();
                    Console.WriteLine($"[PostRepository] GetAllAsync: Loaded {postreactions.Count} reactions at {DateTime.Now}");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[PostRepository] GetAllAsync: Error loading postreactions: {ex.Message}");
                    // Continue without reactions if this fails
                }

                var postsaves = new List<Postsave>();
                try
                {
                    postsaves = await _context.Postsaves
                        .Where(ps => postIds.Contains(ps.PostId))
                        .Include(ps => ps.Account)
                        .ToListAsync();
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine($"Error loading postsaves: {ex.Message}");
                    // Continue without saves if this fails
                }

                Console.WriteLine($"[PostRepository] GetAllAsync: Attaching related data at {DateTime.Now}");
                // Manually attach related data
                foreach (var post in posts)
                {
                    post.Author = authors.FirstOrDefault(a => a.Id == post.AuthorId);
                    post.Comments = comments.Where(c => c.PostId == post.Id).ToList();
                    post.Postreactions = postreactions.Where(pr => pr.PostId == post.Id).ToList();
                    post.Postsaves = postsaves.Where(ps => ps.PostId == post.Id).ToList();
                }

                Console.WriteLine($"[PostRepository] GetAllAsync: Completed at {DateTime.Now}");
                return posts;
            }
            catch (Exception ex)
            {
                // Log the exception for debugging
                System.Diagnostics.Debug.WriteLine($"GetAllAsync error: {ex.Message}");
                System.Diagnostics.Debug.WriteLine($"Stack trace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    System.Diagnostics.Debug.WriteLine($"Inner exception: {ex.InnerException.Message}");
                }
                throw;
            }
        }

        public async Task<IEnumerable<Post>> GetApprovedPostsAsync()
        {
            return await _context.Posts
                .Where(p => p.Status == "Approved" && !p.IsDeleted)
                .Include(p => p.Author)
                .ThenInclude(a => a.Role)
                .Include(p => p.Comments.Where(c => !c.IsDeleted))
                .ThenInclude(c => c.Author)
                .Include(p => p.Postreactions)
                .ThenInclude(pr => pr.User)
                .Include(p => p.Postsaves)
                .ThenInclude(ps => ps.Account)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Post>> GetPendingPostsAsync()
        {
            return await _context.Posts
                .Where(p => p.Status == "Pending" && !p.IsDeleted)
                .Include(p => p.Author)
                .ThenInclude(a => a.Role)
                .Include(p => p.Comments.Where(c => !c.IsDeleted))
                .ThenInclude(c => c.Author)
                .Include(p => p.Postreactions)
                .ThenInclude(pr => pr.User)
                .Include(p => p.Postsaves)
                .ThenInclude(ps => ps.Account)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Post>> GetByAuthorIdAsync(int authorId)
        {
            return await _context.Posts
                .Where(p => p.AuthorId == authorId && !p.IsDeleted)
                .Include(p => p.Author)
                .ThenInclude(a => a.Role)
                .Include(p => p.Comments.Where(c => !c.IsDeleted))
                .ThenInclude(c => c.Author)
                .Include(p => p.Postreactions)
                .ThenInclude(pr => pr.User)
                .Include(p => p.Postsaves)
                .ThenInclude(ps => ps.Account)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

        public async Task<Post> AddAsync(Post post)
        {
            post.CreatedAt = DateTime.Now;
            _context.Posts.Add(post);
            await _context.SaveChangesAsync();
            return post;
        }

        public async Task<Post> UpdateAsync(Post post)
        {
            post.UpdatedAt = DateTime.Now;
            _context.Posts.Update(post);
            await _context.SaveChangesAsync();
            return post;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var post = await _context.Posts.FindAsync(id);
            if (post == null) return false;

            _context.Posts.Remove(post);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> SoftDeleteAsync(int id)
        {
            var post = await _context.Posts.FindAsync(id);
            if (post == null) return false;

            post.IsDeleted = true;
            post.UpdatedAt = DateTime.Now;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<Post> GetByIdWithoutIncludesAsync(int id)
        {
            // Get Post without loading related entities to avoid tracking conflicts
            // Don't use AsNoTracking() because we need to update it
            return await _context.Posts
                .FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted);
        }

        public async Task<int> GetCommentsCountAsync(int postId)
        {
            return await _context.Comments
                .Where(c => c.PostId == postId && !c.IsDeleted)
                .CountAsync();
        }

        public async Task<int> GetReactionsCountAsync(int postId)
        {
            return await _context.Postreactions
                .Where(pr => pr.PostId == postId)
                .CountAsync();
        }

        public async Task<int> GetSavesCountAsync(int postId)
        {
            return await _context.Postsaves
                .Where(ps => ps.PostId == postId)
                .CountAsync();
        }
    }
}