using ESCE_SYSTEM.Models;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace ESCE_SYSTEM.Repositories.PostSaveRepository
{
    public class PostSaveRepository : IPostSaveRepository
    {
        private readonly ESCEContext _dbContext;
        public PostSaveRepository(ESCEContext dbContext) => _dbContext = dbContext;

        public async Task<PostSave?> GetByPostIdAndUserIdAsync(int postId, int userId) =>
            await _dbContext.PostSaves
                .FirstOrDefaultAsync(ps => ps.PostId == postId && ps.AccountId == userId);

        public async Task AddAsync(PostSave postSave) { _dbContext.PostSaves.Add(postSave); await _dbContext.SaveChangesAsync(); }
        public async Task DeleteAsync(PostSave postSave) { _dbContext.PostSaves.Remove(postSave); await _dbContext.SaveChangesAsync(); }
    }
}