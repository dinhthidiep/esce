using ESCE_SYSTEM.DTOs.Tours;
using ESCE_SYSTEM.Models;

namespace ESCE_SYSTEM.Repositories.TourRepository
{
    public interface ITourRepository
    {
        Task<IEnumerable<Tour>> GetAllToursAsync();
        Task<Tour?> GetTourByIdAsync(int id);
        Task<Tour> CreateTourAsync(Tour tour);
        Task<Tour?> UpdateTourAsync(Tour tour);
        Task<bool> DeleteTourAsync(int id);
        Task<IEnumerable<Tour>> SearchToursAsync(TourSearchDto searchDto);
        Task<int> GetTotalToursCountAsync(TourSearchDto searchDto);
        Task<bool> TourExistsAsync(int id);
        Task<IEnumerable<Tour>> GetToursByHostIdAsync(int hostId);
        Task<IEnumerable<Tour>> GetAvailableToursAsync();
    }
}

