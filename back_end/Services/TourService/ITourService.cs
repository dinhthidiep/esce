using ESCE_SYSTEM.DTOs.Tours;

namespace ESCE_SYSTEM.Services.TourService
{
    public interface ITourService
    {
        Task<IEnumerable<TourResponseDto>> GetAllToursAsync();
        Task<TourResponseDto?> GetTourByIdAsync(int id);
        Task<TourResponseDto> CreateTourAsync(CreateTourDto createTourDto);
        Task<TourResponseDto?> UpdateTourAsync(UpdateTourDto updateTourDto);
        Task<bool> DeleteTourAsync(int id);
        Task<(IEnumerable<TourResponseDto> Tours, int TotalCount)> SearchToursAsync(TourSearchDto searchDto);
        Task<IEnumerable<TourResponseDto>> GetToursByHostIdAsync(int hostId);
        Task<IEnumerable<TourResponseDto>> GetAvailableToursAsync();
        Task<bool> TourExistsAsync(int id);
    }
}

