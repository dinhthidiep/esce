using ESCE_SYSTEM.DTOs.Statistics;
using ESCE_SYSTEM.Models;
using Microsoft.EntityFrameworkCore;

namespace ESCE_SYSTEM.Services.StatisticsService
{
    public class StatisticsService : IStatisticsService
    {
        private readonly ESCEContext _dbContext;

        public StatisticsService(ESCEContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<StatisticsDto> GetStatisticsAsync()
        {
            var statistics = new StatisticsDto();

            // Tổng số users
            statistics.TotalUsers = await _dbContext.Accounts.CountAsync();
            statistics.ActiveUsers = await _dbContext.Accounts.CountAsync(a => a.IsActive == true && !a.IsBanned);
            statistics.BannedUsers = await _dbContext.Accounts.CountAsync(a => a.IsBanned);

            // Thống kê theo role
            var roleStats = await _dbContext.Accounts
                .Include(a => a.Role)
                .GroupBy(a => a.Role.Name)
                .Select(g => new UserRoleStatistic
                {
                    RoleName = g.Key ?? "Unknown",
                    Count = g.Count()
                })
                .ToListAsync();
            statistics.UserRoleStatistics = roleStats;

            // Tổng số posts
            statistics.TotalPosts = await _dbContext.Posts.CountAsync(p => !p.IsDeleted);
            statistics.PendingPosts = await _dbContext.Posts.CountAsync(p => !p.IsDeleted && p.Status == "Pending");
            statistics.ApprovedPosts = await _dbContext.Posts.CountAsync(p => !p.IsDeleted && p.Status == "Approved");
            statistics.RejectedPosts = await _dbContext.Posts.CountAsync(p => !p.IsDeleted && p.Status == "Rejected");

            // Tổng số bookings
            statistics.TotalBookings = await _dbContext.Bookings.CountAsync();
            statistics.PendingBookings = await _dbContext.Bookings.CountAsync(b => b.Status == "pending");
            statistics.ConfirmedBookings = await _dbContext.Bookings.CountAsync(b => b.Status == "confirmed");
            statistics.CancelledBookings = await _dbContext.Bookings.CountAsync(b => b.Status == "cancelled");

            // Tổng doanh thu (từ bookings đã confirmed)
            statistics.TotalRevenue = await _dbContext.Bookings
                .Where(b => b.Status == "confirmed")
                .SumAsync(b => (decimal?)b.TotalAmount) ?? 0;

            // Doanh thu theo tháng (6 tháng gần nhất)
            var sixMonthsAgo = DateTime.UtcNow.AddMonths(-6);
            var monthlyRevenues = await _dbContext.Bookings
                .Where(b => b.Status == "confirmed" && b.BookingDate >= sixMonthsAgo)
                .GroupBy(b => new { Year = b.BookingDate.Value.Year, Month = b.BookingDate.Value.Month })
                .Select(g => new MonthlyRevenue
                {
                    Month = $"{g.Key.Year}-{g.Key.Month:D2}",
                    Revenue = g.Sum(b => (decimal?)b.TotalAmount) ?? 0
                })
                .OrderBy(m => m.Month)
                .ToListAsync();
            statistics.MonthlyRevenues = monthlyRevenues;

            // Tổng số news
            statistics.TotalNews = await _dbContext.News.CountAsync();

            // Tổng số services
            statistics.TotalServices = await _dbContext.Services.CountAsync();

            // Tổng số service combos
            statistics.TotalServiceCombos = await _dbContext.Servicecombos.CountAsync();

            // Số lượng certificate đang pending
            statistics.PendingAgencyCertificates = await _dbContext.AgencieCertificates
                .CountAsync(ac => ac.Status == "Pending");
            statistics.PendingHostCertificates = await _dbContext.HostCertificates
                .CountAsync(hc => hc.Status == "Pending");

            return statistics;
        }
    }
}

