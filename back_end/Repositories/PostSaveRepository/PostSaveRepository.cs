using ESCE_SYSTEM.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ESCE_SYSTEM.Repositories
{
    public class PostSaveRepository : IPostSaveRepository
    {
        private readonly ESCEContext _context;

        public PostSaveRepository(ESCEContext context)
        {
            _context = context;
        }

        public async Task<Postsave> GetByIdAsync(int id)
        {
            return await _context.Postsaves
                .Include(ps => ps.Account)
                .Include(ps => ps.Post)
                .FirstOrDefaultAsync(ps => ps.Id == id);
        }

        public async Task<IEnumerable<Postsave>> GetByUserIdAsync(int userId)
        {
            return await _context.Postsaves
                .Where(ps => ps.AccountId == userId)
                .Include(ps => ps.Post)
                .ThenInclude(p => p.Author)
                .OrderByDescending(ps => ps.SavedAt)
                .ToListAsync();
        }

        public async Task<Postsave> GetByUserAndPostAsync(int userId, int postId)
        {
            return await _context.Postsaves
                .FirstOrDefaultAsync(ps => ps.AccountId == userId && ps.PostId == postId);
        }

        public async Task<Postsave> AddAsync(Postsave postSave)
        {
            postSave.SavedAt = DateTime.Now;
            _context.Postsaves.Add(postSave);
            await _context.SaveChangesAsync();
            return postSave;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var postSave = await _context.Postsaves.FindAsync(id);
            if (postSave == null) return false;

            _context.Postsaves.Remove(postSave);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<int> GetCountByPostIdAsync(int postId)
        {
            return await _context.Postsaves
                .Where(ps => ps.PostId == postId)
                .CountAsync();
        }
    }
}