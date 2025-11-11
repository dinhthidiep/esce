using System.Collections.Generic;

namespace ESCE_SYSTEM.DTOs.Post
{
    public class PaginatedTourComboResponseDto
    {
        public List<TourComboResponseDto> Items { get; set; } = new List<TourComboResponseDto>();
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
        public bool HasPreviousPage { get; set; }
        public bool HasNextPage { get; set; }
    }
}

