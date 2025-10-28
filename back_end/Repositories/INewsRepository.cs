using Learnasp.Models;

namespace Learnasp.Repositories
{
    public interface INewsRepository
    {
        Task<IEnumerable<News>> GetAllAsync();
        Task<News?> GetByIdAsync(int id);
        Task<IEnumerable<News>> GetByAccountIdAsync(int accountId);
        Task CreateAsync(News news);
        Task UpdateAsync(News news);
        Task DeleteAsync(int id);
    }
}


