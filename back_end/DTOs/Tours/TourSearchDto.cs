namespace ESCE_SYSTEM.DTOs.Tours
{
    public class TourSearchDto
    {
        public string? SearchKey { get; set; } // Tìm kiếm chung cho tên và địa chỉ
        public string? Address { get; set; } // Tìm kiếm theo địa chỉ cụ thể
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public DateTime? StartDateFrom { get; set; }
        public DateTime? StartDateTo { get; set; }
        public DateTime? EndDateFrom { get; set; }
        public DateTime? EndDateTo { get; set; }
        public string? Status { get; set; }
        public int? HostId { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? SortBy { get; set; } = "rating"; // Mặc định sort theo đánh giá
        public string? SortOrder { get; set; } = "desc"; // "asc" or "desc"
    }
}

