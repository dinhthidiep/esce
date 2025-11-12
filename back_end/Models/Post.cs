using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;

namespace ESCE_SYSTEM.Models
{
    public partial class Post
    {
        public Post()
        {
            Comments = new HashSet<Comment>();
            Postreactions = new HashSet<Postreaction>();
            Postsaves = new HashSet<Postsave>();
        }

        public int Id { get; set; }
        public string Title { get; set; } = null!;
        public string Content { get; set; } = null!;
        public int AuthorId { get; set; }
        public string? Image { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string Status { get; set; } = null!;
        public string? RejectComment { get; set; }
        public string? ReviewComments { get; set; }
        public bool IsDeleted { get; set; }
        public int CommentsCount { get; set; }
        public int ReactionsCount { get; set; }
        public int SavesCount { get; set; }

        [ValidateNever]
        public virtual Account? Author { get; set; }
        [ValidateNever]
        public virtual ICollection<Comment> Comments { get; set; }
        [ValidateNever]
        public virtual ICollection<Postreaction> Postreactions { get; set; }
        [ValidateNever]
        public virtual ICollection<Postsave> Postsaves { get; set; }
    }
}
