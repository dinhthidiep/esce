using ESCE_SYSTEM.Models;

namespace ESCE_SYSTEM.Services
{
    public interface INewsService
    {
        Task<IEnumerable<News>> GetAllAsync();
        Task<News?> GetByIdAsync(int id);
        Task<IEnumerable<News>> GetByAccountIdAsync(int accountId);
        Task<News> CreateAsync(News news);
        Task<News?> UpdateAsync(int id, News news);
        Task<bool> DeleteAsync(int id);
    }
}


