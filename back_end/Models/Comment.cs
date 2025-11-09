using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESCE_SYSTEM.Models
{
    [Table("COMMENTS")]
    public partial class Comment
    {
        public Comment()
        {
            InverseParentComment = new HashSet<Comment>();
        }

        [Column("ID")]
        public int Id { get; set; }

        [Column("POST_ID")]
        public int PostId { get; set; }

        [Column("AUTHOR_ID")]
        public int AuthorId { get; set; }

        [Column("PARENT_COMMENT_ID")]
        public int? ParentCommentId { get; set; }

        [Column("CONTENT")]
        public string Content { get; set; } = null!;

        [Column("CREATED_AT")]
        public DateTime? CreatedAt { get; set; }

        [Column("Image")]
        public string? Image { get; set; }

        // Navigation properties
        [ForeignKey("AuthorId")]
        public virtual Account Author { get; set; } = null!;

        [ForeignKey("ParentCommentId")]
        public virtual Comment? ParentComment { get; set; }

        [ForeignKey("PostId")]
        public virtual Post Post { get; set; } = null!;

        public virtual ICollection<Comment> InverseParentComment { get; set; }
    }
}
