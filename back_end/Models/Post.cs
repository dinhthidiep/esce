using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESCE_SYSTEM.Models
{
    [Table("POSTS")]
    public class Post
    {
        [Column("ID")]
        public int Id { get; set; }

        [Column("AUTHOR_ID")]
        public int AuthorId { get; set; }

        [Column("CREATED_AT")]
        public DateTime CreatedAt { get; set; }

        [Column("TITLE")]
        public string Title { get; set; } = string.Empty;

        [Column("CONTENT")]
        public string Content { get; set; } = string.Empty;

        [Column("Image")]
        public string? Image { get; set; }

        [Column("UPDATED_AT")]
        public DateTime UpdatedAt { get; set; }

        // Navigation property
        [ForeignKey("AuthorId")]
        public virtual Account? Author { get; set; }
    }
}
