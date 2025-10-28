using ESCE_SYSTEM.Models;
using System.Threading.Tasks;

namespace ESCE_SYSTEM.Repositories.PostSaveRepository
{
    public interface IPostSaveRepository
    {
        Task<PostSave?> GetByPostIdAndUserIdAsync(int postId, int userId);
        Task AddAsync(PostSave postSave);
        Task DeleteAsync(PostSave postSave);
    }
}