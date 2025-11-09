using ESCE_SYSTEM.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ESCE_SYSTEM.Repositories.PostCommentRepository
{
    public class PostCommentRepository : IPostCommentRepository
    {
        private readonly ESCEContext _dbContext; // Giả sử đây là DbContext của bạn

        public PostCommentRepository(ESCEContext dbContext)
        {
            _dbContext = dbContext;
        }

        // --- Truy vấn ---

        public async Task<Comment?> GetByIdAsync(int id)
        {
            // Tìm kiếm theo Primary Key
            return await _dbContext.Comments.FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<List<Comment>> GetByPostIdAsync(int postId)
        {
            // Lấy tất cả bình luận của một bài viết (theo PostId là Khóa ngoại)
            // Bạn có thể thêm .Include(c => c.Author) để lấy thông tin người bình luận
            return await _dbContext.Comments
                .Where(c => c.PostId == postId)
                .OrderByDescending(c => c.CreatedAt) // Sắp xếp theo thời gian mới nhất
                .ToListAsync();
        }

        // --- Thao tác Dữ liệu (CRUD) ---

        public async Task AddAsync(Comment comment)
        {
            _dbContext.Comments.Add(comment);
            await _dbContext.SaveChangesAsync();
        }

        public async Task UpdateAsync(Comment comment)
        {
            // EF Core tự theo dõi trạng thái, chỉ cần gọi SaveChanges
            _dbContext.Comments.Update(comment);
            await _dbContext.SaveChangesAsync();
        }

        public async Task DeleteAsync(Comment comment)
        {
            _dbContext.Comments.Remove(comment);
            await _dbContext.SaveChangesAsync();
        }
    }
}