namespace ESCE_SYSTEM.DTOs.Post
{
    public class PostCommentDto
    {
        public int PostId { get; set; } // ID của bài viết (int)
        public int? ParentCommentId { get; set; } // ID của bình luận cha (int?)
        public string Content { get; set; } = null!;
        public string? Image { get; set; } // Image URL/Path
    }
}
