using System.Collections.Generic;

namespace ESCE_SYSTEM.DTOs.Post
{
    public class CommentResponseDto
    {
        public int Id { get; set; }
        public int PostId { get; set; }
        public int AuthorId { get; set; }
        public string AuthorName { get; set; } = null!;
        public string? AuthorAvatar { get; set; }
        public string Content { get; set; } = null!;
        public string? Image { get; set; }
        public DateTime? CreatedAt { get; set; }
        public int? ParentCommentId { get; set; }
        public int ReactionsCount { get; set; }
        public Dictionary<string, int> ReactionCounts { get; set; } = new Dictionary<string, int>();
        public string? CurrentUserReaction { get; set; }
        public List<CommentResponseDto> Replies { get; set; } = new List<CommentResponseDto>();
    }
}
