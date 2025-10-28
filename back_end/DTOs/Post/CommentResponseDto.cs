namespace ESCE_SYSTEM.DTOs.Post
{
    public class CommentResponseDto
    {
        public int Id { get; set; }
        public int PostId { get; set; }
        public string AuthorName { get; set; } = null!;
        public string Content { get; set; } = null!;
        public string? Image { get; set; }
        public DateTime? CreatedAt { get; set; }
    }
}
