using Learnasp.Models;
using Learnasp.Repositories;

namespace Learnasp.Services
{
    public class NewsService : INewsService
    {
        private readonly INewsRepository _repository;

        public NewsService(INewsRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<News>> GetAllAsync()
        {
            return await _repository.GetAllAsync();
        }

        public async Task<News?> GetByIdAsync(int id)
        {
            return await _repository.GetByIdAsync(id);
        }

        public async Task<IEnumerable<News>> GetByAccountIdAsync(int accountId)
        {
            return await _repository.GetByAccountIdAsync(accountId);
        }

        public async Task<News> CreateAsync(News news)
        {
            news.CreatedDate = DateTime.Now;
            await _repository.CreateAsync(news);
            return news;
        }

        public async Task<News?> UpdateAsync(int id, News news)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return null;

            existing.Title = news.Title;
            existing.Image = news.Image;
            existing.SocialMediaLink = news.SocialMediaLink;

            await _repository.UpdateAsync(existing);
            return existing;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return false;

            await _repository.DeleteAsync(id);
            return true;
        }
    }
}


