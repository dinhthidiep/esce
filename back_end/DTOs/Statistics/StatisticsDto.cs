namespace ESCE_SYSTEM.DTOs.Statistics
{
    public class StatisticsDto
    {
        public int TotalUsers { get; set; }
        public int TotalPosts { get; set; }
        public int TotalBookings { get; set; }
        public int TotalNews { get; set; }
        public int TotalServices { get; set; }
        public int TotalServiceCombos { get; set; }
        public int PendingPosts { get; set; }
        public int ApprovedPosts { get; set; }
        public int RejectedPosts { get; set; }
        public int ActiveUsers { get; set; }
        public int BannedUsers { get; set; }
        public decimal TotalRevenue { get; set; }
        public int PendingBookings { get; set; }
        public int ConfirmedBookings { get; set; }
        public int CancelledBookings { get; set; }
        public int PendingAgencyCertificates { get; set; }
        public int PendingHostCertificates { get; set; }
        public List<UserRoleStatistic> UserRoleStatistics { get; set; } = new();
        public List<MonthlyRevenue> MonthlyRevenues { get; set; } = new();
    }

    public class UserRoleStatistic
    {
        public string RoleName { get; set; } = string.Empty;
        public int Count { get; set; }
    }

    public class MonthlyRevenue
    {
        public string Month { get; set; } = string.Empty;
        public decimal Revenue { get; set; }
    }
}

