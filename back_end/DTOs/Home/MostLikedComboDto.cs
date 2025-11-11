namespace ESCE_SYSTEM.DTOs.Home
{
    public class MostLikedComboDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string? Image { get; set; }
        public double AverageRating { get; set; }
        public int TotalReviews { get; set; }
        public int TotalBookings { get; set; }
        public string? DiscountLabel { get; set; }
    }
}

