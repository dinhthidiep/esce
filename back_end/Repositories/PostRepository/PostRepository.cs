using ESCE_SYSTEM.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;

namespace ESCE_SYSTEM.Repositories.PostRepository
{
    public class PostRepository : IPostRepository
    {
        private readonly ESCEContext _dbContext;

        public PostRepository(ESCEContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<List<Post>> GetAllAsync()
        {
            return await _dbContext.Posts.ToListAsync();
        }

        public async Task<Post?> GetByIdAsync(int id)
        {
            // Tìm kiếm theo Primary Key Id (int)
            return await _dbContext.Posts.FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task AddAsync(Post post)
        {
            _dbContext.Posts.Add(post);
            await _dbContext.SaveChangesAsync();
        }

        public async Task UpdateAsync(Post post)
        {
            _dbContext.Posts.Update(post);
            await _dbContext.SaveChangesAsync();
        }

        public async Task DeleteAsync(Post post)
        {
            _dbContext.Posts.Remove(post);
            await _dbContext.SaveChangesAsync();
        }
    }
}