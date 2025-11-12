using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;

namespace ESCE_SYSTEM.Models
{
    public partial class Postreaction
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int PostId { get; set; }
        public byte ReactionTypeId { get; set; }
        public DateTime? CreatedAt { get; set; }

        [ValidateNever]
        public virtual Post? Post { get; set; }
        [ValidateNever]
        public virtual ReactionType? ReactionType { get; set; }
        [ValidateNever]
        public virtual Account? User { get; set; }
    }
}
