using System.Collections.Generic;

namespace ESCE_SYSTEM.DTOs.Post
{
    public class PostResponseDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = null!;
        public string Content { get; set; } = null!;
        public string AuthorName { get; set; } = null!;
        public int AuthorId { get; set; }
        public string? AuthorAvatar { get; set; }
        public string? Image { get; set; }
        public DateTime? CreatedAt { get; set; }
        public int CommentsCount { get; set; }
        public int ReactionsCount { get; set; }
        public Dictionary<string, int> ReactionCounts { get; set; } = new Dictionary<string, int>();
        public string? CurrentUserReaction { get; set; } // null if no reaction, otherwise the reaction type
    }
}
