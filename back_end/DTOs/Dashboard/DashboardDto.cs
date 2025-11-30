namespace ESCE_SYSTEM.DTOs.Dashboard
{
    public class DashboardDto
    {
        // Header Summary Cards
        public int TotalUsers { get; set; }
        public string UserGrowth { get; set; } = string.Empty; // e.g., "+18% so với tháng trước"
        public int TotalPosts { get; set; }
        public string PostGrowth { get; set; } = string.Empty; // e.g., "+32 bài viết mới tuần này"
        public int PendingSupports { get; set; }
        public int TotalViews { get; set; } // Total interactions/views (comments + reactions + messages)

        // Quick Static
        public int TodayComments { get; set; }
        public int TodayReactions { get; set; }
        public int TodayChatMessages { get; set; }
        public int UnreadNotifications { get; set; }
        public int ActiveTours { get; set; }
        public int TodayBookings { get; set; }

        // Recent Activities
        public List<ActivityDto> RecentActivities { get; set; } = new();

        // Priority Tasks
        public int UrgentSupports { get; set; }
        public int PendingUpgradeRequests { get; set; }
        public int UnreadMessages { get; set; }

        // Popular Posts
        public List<PopularPostDto> PopularPosts { get; set; } = new();
    }

    public class ActivityDto
    {
        public string Description { get; set; } = string.Empty;
        public string TimeAgo { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty; // "user", "post", "support", "news", "upgrade"
    }

    public class PopularPostDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string AuthorName { get; set; } = string.Empty;
        public int ReactionsCount { get; set; }
        public int CommentsCount { get; set; }
        public DateTime? CreatedAt { get; set; }
    }
}

