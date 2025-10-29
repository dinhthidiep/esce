namespace ESCE_SYSTEM.DTOs.Post
{
    public class PostResponseDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = null!;
        public string Content { get; set; } = null!;
        public string AuthorName { get; set; } = null!;
        public string? Image { get; set; }
        public DateTime? CreatedAt { get; set; }
    }
}
