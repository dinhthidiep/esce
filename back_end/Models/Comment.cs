using System;
using System.Collections.Generic;

namespace ESCE_SYSTEM.Models
{
    public partial class Comment
    {
        public Comment()
        {
            InverseParentComment = new HashSet<Comment>();
        }

        public int Id { get; set; }
        public int PostId { get; set; }
        public int AuthorId { get; set; }
        public int? ParentCommentId { get; set; }
        public string Content { get; set; } = null!;
        public DateTime? CreatedAt { get; set; }

        public virtual Account Author { get; set; } = null!;
        public virtual Comment? ParentComment { get; set; }
        public virtual Post Post { get; set; } = null!;
        public virtual ICollection<Comment> InverseParentComment { get; set; }
    }
}
