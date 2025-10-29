using System;
using System.Collections.Generic;

namespace ESCE_SYSTEM.Models
{
    public partial class Post
    {
        public Post()
        {
            Comments = new HashSet<Comment>();
            PostSaves = new HashSet<PostSave>();
        }

        public int Id { get; set; }
        public string Title { get; set; } = null!;
        public string Content { get; set; } = null!;
        public int AuthorId { get; set; }
        public string? Image { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        public virtual Account Author { get; set; } = null!;
        public virtual ICollection<Comment> Comments { get; set; }
        public virtual ICollection<PostSave> PostSaves { get; set; }
    }
}
