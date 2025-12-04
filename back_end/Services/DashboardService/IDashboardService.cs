using ESCE_SYSTEM.DTOs.Dashboard;

namespace ESCE_SYSTEM.Services.DashboardService
{
    public interface IDashboardService
    {
        Task<DashboardDto> GetDashboardDataAsync();
    }
}

