namespace ESCE_SYSTEM.DTOs.Post
{
    public class TourComboSearchDto
    {
        public string? Keyword { get; set; }
        public string? Location { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public string? Status { get; set; }
        public string? SortBy { get; set; } // name, price, createdAt
        public string? SortOrder { get; set; } // asc, desc
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}

