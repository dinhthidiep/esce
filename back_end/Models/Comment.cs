using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;

namespace ESCE_SYSTEM.Models
{
    public partial class Comment
    {
        public Comment()
        {
            InverseParentComment = new HashSet<Comment>();
            Commentreactions = new HashSet<Commentreaction>();
        }

        public int Id { get; set; }
        public int PostId { get; set; }
        public int AuthorId { get; set; }
        public int? ParentCommentId { get; set; }
        public string Content { get; set; } = null!;
        public DateTime? CreatedAt { get; set; }
        public string? Image { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int ReactionsCount { get; set; }
        public bool IsDeleted { get; set; }

        [ValidateNever]
        public virtual Account? Author { get; set; }
        [ValidateNever]
        public virtual Comment? ParentComment { get; set; }
        [ValidateNever]
        public virtual Post? Post { get; set; }
        [ValidateNever]
        public virtual ICollection<Comment> InverseParentComment { get; set; }
        [ValidateNever]
        public virtual ICollection<Commentreaction> Commentreactions { get; set; }
    }
}
