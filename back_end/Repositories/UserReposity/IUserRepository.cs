using ESCE_SYSTEM.Models;

namespace ESCE_SYSTEM.Repositories.UserRepository
{
    public interface IUserRepository
    {
        Task<Account> GetByEmailAsync(string email);
        Task AddAsync(Account account);
        Task UpdateAsync(Account account);
    }
}