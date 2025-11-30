using ESCE_SYSTEM.DTOs.Statistics;

namespace ESCE_SYSTEM.Services.StatisticsService
{
    public interface IStatisticsService
    {
        Task<StatisticsDto> GetStatisticsAsync();
    }
}

