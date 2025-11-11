namespace ESCE_SYSTEM.DTOs.Home
{
    public class TestimonialDto
    {
        public int Rating { get; set; }
        public string Content { get; set; } = string.Empty;
        public string AuthorName { get; set; } = string.Empty;
        public string? AuthorAvatar { get; set; }
        public string ServiceName { get; set; } = string.Empty;
        public string TimeAgo { get; set; } = string.Empty;
    }
}

