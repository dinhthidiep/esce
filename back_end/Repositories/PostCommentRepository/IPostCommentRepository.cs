using ESCE_SYSTEM.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ESCE_SYSTEM.Repositories.PostCommentRepository
{
    public interface IPostCommentRepository
    {
        Task<List<Comment>> GetByPostIdAsync(int postId); // int ID
        Task<Comment?> GetByIdAsync(int id); // int ID
        Task AddAsync(Comment comment);
        Task UpdateAsync(Comment comment);
        Task DeleteAsync(Comment comment);
    }
}