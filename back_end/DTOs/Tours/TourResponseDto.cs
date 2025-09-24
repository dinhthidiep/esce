namespace ESCE_SYSTEM.DTOs.Tours
{
    public class TourResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string Address { get; set; } = null!;
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int Capacity { get; set; }
        public int AvailableSlots { get; set; }
        public string? Image { get; set; }
        public string? Status { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int HostId { get; set; }
        public string? HostName { get; set; }
        public double? AverageRating { get; set; } // Đánh giá trung bình
        public int TotalReviews { get; set; } // Tổng số đánh giá
    }
}

