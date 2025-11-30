using ESCE_SYSTEM.DTOs.Statistics;

namespace ESCE_SYSTEM.Services.StatisticsService
{
    public interface IStatisticsService
    {
<<<<<<< HEAD
        Task<StatisticsDto> GetStatisticsAsync();
    }
}

=======
        // Thống kê tổng quan dashboard
        Task<DashboardStatisticsDto> GetDashboardStatisticsAsync(StatisticsFilterDto filter);
        
        // Thống kê theo thời gian (biểu đồ)
        Task<TimeSeriesStatisticsDto> GetTimeSeriesStatisticsAsync(StatisticsFilterDto filter);
        
        // Thống kê chi tiết người dùng
        Task<UserStatisticsDto> GetUserStatisticsAsync(StatisticsFilterDto filter);
        
        // Thống kê doanh thu
        Task<RevenueStatisticsDto> GetRevenueStatisticsAsync(StatisticsFilterDto filter);
        
        // Thống kê ServiceCombo
        Task<ServiceComboStatisticsDto> GetServiceComboStatisticsAsync(StatisticsFilterDto filter);
        
        // Thống kê bài viết
        Task<PostStatisticsDto> GetPostStatisticsAsync(StatisticsFilterDto filter);
    }
}


>>>>>>> 23dee672e153f1e3b54dbddd4634f47a97a71ddc
