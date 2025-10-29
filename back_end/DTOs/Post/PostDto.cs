namespace ESCE_SYSTEM.DTOs.Post
{
    public class PostDto
    {
        public string Title { get; set; } = null!;
        public string Content { get; set; } = null!;
        public string? Image { get; set; } // Sử dụng 1 string cho Image URL
        
    }
}
