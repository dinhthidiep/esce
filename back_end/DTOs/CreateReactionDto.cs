namespace ESCE_SYSTEM.DTOs
{
    public class CreateReactionDto
    {
        public string TargetType { get; set; } = null!; // "POST" or "COMMENT"
        public int TargetId { get; set; }
        public string ReactionType { get; set; } = null!; // "like", "love", "haha", "wow", "dislike"
    }
}

