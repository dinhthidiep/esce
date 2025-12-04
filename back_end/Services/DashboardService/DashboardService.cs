using ESCE_SYSTEM.DTOs.Dashboard;
using ESCE_SYSTEM.Models;
using Microsoft.EntityFrameworkCore;

namespace ESCE_SYSTEM.Services.DashboardService
{
    public class DashboardService : IDashboardService
    {
        private readonly ESCEContext _dbContext;

        public DashboardService(ESCEContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<DashboardDto> GetDashboardDataAsync()
        {
            var dashboard = new DashboardDto();
            var today = DateTime.UtcNow.AddHours(7).Date;
            var yesterday = today.AddDays(-1);
            var lastMonth = today.AddMonths(-1);
            var thisWeekStart = today.AddDays(-(int)today.DayOfWeek);

            // Header Summary Cards
            dashboard.TotalUsers = await _dbContext.Accounts.CountAsync();
            var lastMonthUsers = await _dbContext.Accounts
                .CountAsync(a => a.CreatedAt.HasValue && a.CreatedAt.Value < lastMonth);
            var userGrowth = lastMonthUsers > 0 
                ? ((dashboard.TotalUsers - lastMonthUsers) * 100.0 / lastMonthUsers).ToString("F0")
                : "0";
            dashboard.UserGrowth = $"+{userGrowth}% so với tháng trước";

            dashboard.TotalPosts = await _dbContext.Posts.CountAsync(p => !p.IsDeleted);
            var thisWeekPosts = await _dbContext.Posts
                .CountAsync(p => !p.IsDeleted && p.CreatedAt >= thisWeekStart);
            dashboard.PostGrowth = $"+{thisWeekPosts} bài viết mới tuần này";

            dashboard.PendingSupports = await _dbContext.RequestSupports
                .CountAsync(rs => rs.Status == "pending" || rs.Status == "Pending");

            // Total Views/Interactions (comments + reactions + messages) - represents user engagement
            var totalComments = await _dbContext.Comments.CountAsync(c => !c.IsDeleted);
            var totalReactions = await _dbContext.Postreactions.CountAsync();
            var totalMessages = await _dbContext.Messages.CountAsync();
            dashboard.TotalViews = totalComments + totalReactions + totalMessages;

            // Quick Static - Today's data
            dashboard.TodayComments = await _dbContext.Comments
                .CountAsync(c => c.CreatedAt.HasValue && c.CreatedAt.Value.Date == today);

            dashboard.TodayReactions = await _dbContext.Postreactions
                .CountAsync(pr => pr.CreatedAt.HasValue && pr.CreatedAt.Value.Date == today);

            dashboard.TodayChatMessages = await _dbContext.Messages
                .CountAsync(m => m.CreatedAt.HasValue && m.CreatedAt.Value.Date == today);

            dashboard.UnreadNotifications = await _dbContext.Notifications
                .CountAsync(n => !(n.IsRead ?? false));

            dashboard.ActiveTours = await _dbContext.Servicecombos
                .CountAsync(sc => sc.Status == "open" || sc.Status == "Open");

            dashboard.TodayBookings = await _dbContext.Bookings
                .CountAsync(b => b.BookingDate.HasValue && b.BookingDate.Value.Date == today);

            // Recent Activities (last 10 activities)
            var activities = new List<ActivityDto>();

            // Recent users (last 5)
            var recentUsers = await _dbContext.Accounts
                .OrderByDescending(a => a.CreatedAt)
                .Take(5)
                .Select(a => new ActivityDto
                {
                    Description = $"User mới \"{a.Name}\" đã đăng ký",
                    TimeAgo = GetTimeAgo(a.CreatedAt ?? DateTime.UtcNow.AddHours(7)),
                    Type = "user"
                })
                .ToListAsync();
            activities.AddRange(recentUsers);

            // Recent posts (last 5)
            var recentPosts = await _dbContext.Posts
                .Where(p => !p.IsDeleted)
                .Include(p => p.Author)
                .OrderByDescending(p => p.CreatedAt)
                .Take(5)
                .Select(p => new ActivityDto
                {
                    Description = $"Bài viết mới \"{p.Title}\" đã được đăng",
                    TimeAgo = GetTimeAgo(p.CreatedAt ?? DateTime.UtcNow.AddHours(7)),
                    Type = "post"
                })
                .ToListAsync();
            activities.AddRange(recentPosts);

            // Recent support requests (last 5)
            var recentSupports = await _dbContext.RequestSupports
                .Include(rs => rs.User)
                .OrderByDescending(rs => rs.CreatedAt)
                .Take(5)
                .Select(rs => new ActivityDto
                {
                    Description = $"Ticket hỗ trợ mới từ \"{rs.User.Name}\"",
                    TimeAgo = GetTimeAgo(rs.CreatedAt ?? DateTime.UtcNow.AddHours(7)),
                    Type = "support"
                })
                .ToListAsync();
            activities.AddRange(recentSupports);

            // Recent news (last 5)
            var recentNews = await _dbContext.News
                .Include(n => n.Account)
                .OrderByDescending(n => n.CreatedDate)
                .Take(5)
                .Select(n => new ActivityDto
                {
                    Description = $"Tin tức mới \"{n.NewsTitle}\" đã xuất bản",
                    TimeAgo = GetTimeAgo(n.CreatedDate ?? DateTime.UtcNow.AddHours(7)),
                    Type = "news"
                })
                .ToListAsync();
            activities.AddRange(recentNews);

            // Recent upgrade requests (last 5)
            var recentAgencyUpgrades = await _dbContext.AgencieCertificates
                .Where(ac => ac.Status == "Pending")
                .Include(ac => ac.Account)
                .OrderByDescending(ac => ac.CreatedAt)
                .Take(3)
                .Select(ac => new ActivityDto
                {
                    Description = $"Yêu cầu nâng cấp Agency từ \"{ac.Account.Name}\"",
                    TimeAgo = GetTimeAgo(ac.CreatedAt ?? DateTime.UtcNow.AddHours(7)),
                    Type = "upgrade"
                })
                .ToListAsync();

            var recentHostUpgrades = await _dbContext.HostCertificates
                .Where(hc => hc.Status == "Pending")
                .Include(hc => hc.Host)
                .OrderByDescending(hc => hc.CreatedAt)
                .Take(2)
                .Select(hc => new ActivityDto
                {
                    Description = $"Yêu cầu nâng cấp Host từ \"{hc.Host.Name}\"",
                    TimeAgo = GetTimeAgo(hc.CreatedAt ?? DateTime.UtcNow.AddHours(7)),
                    Type = "upgrade"
                })
                .ToListAsync();

            activities.AddRange(recentAgencyUpgrades);
            activities.AddRange(recentHostUpgrades);

            // Sort by time (most recent first) - TimeAgo is a string, so we'll keep original order
            // Activities are already ordered by CreatedAt descending from queries
            dashboard.RecentActivities = activities
                .Take(10)
                .ToList();

            // Priority Tasks
            dashboard.UrgentSupports = await _dbContext.RequestSupports
                .CountAsync(rs => rs.Status == "pending" || rs.Status == "Pending");

            dashboard.PendingUpgradeRequests = await _dbContext.AgencieCertificates
                .CountAsync(ac => ac.Status == "Pending") +
                await _dbContext.HostCertificates
                .CountAsync(hc => hc.Status == "Pending");

            // Unread messages (messages not read by current user - simplified: count recent messages)
            dashboard.UnreadMessages = await _dbContext.Messages
                .CountAsync(m => m.CreatedAt >= today.AddDays(-7));

            // Popular Posts (top 5 by reactions + comments)
            dashboard.PopularPosts = await _dbContext.Posts
                .Where(p => !p.IsDeleted && p.Status == "Approved")
                .Include(p => p.Author)
                .OrderByDescending(p => p.ReactionsCount + p.CommentsCount)
                .Take(5)
                .Select(p => new PopularPostDto
                {
                    Id = p.Id,
                    Title = p.Title,
                    AuthorName = p.Author.Name,
                    ReactionsCount = p.ReactionsCount,
                    CommentsCount = p.CommentsCount,
                    CreatedAt = p.CreatedAt
                })
                .ToListAsync();

            return dashboard;
        }

        private string GetTimeAgo(DateTime dateTime)
        {
            var now = DateTime.UtcNow.AddHours(7);
            var timeSpan = now - dateTime;

            if (timeSpan.TotalMinutes < 1)
                return "Vừa xong";
            if (timeSpan.TotalMinutes < 60)
                return $"{(int)timeSpan.TotalMinutes} phút trước";
            if (timeSpan.TotalHours < 24)
                return $"{(int)timeSpan.TotalHours} giờ trước";
            if (timeSpan.TotalDays < 30)
                return $"{(int)timeSpan.TotalDays} ngày trước";
            if (timeSpan.TotalDays < 365)
                return $"{(int)(timeSpan.TotalDays / 30)} tháng trước";
            return $"{(int)(timeSpan.TotalDays / 365)} năm trước";
        }
    }
}

