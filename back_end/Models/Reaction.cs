using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESCE_SYSTEM.Models
{
    [Table("REACTIONS")]
    public partial class Reaction
    {
        [Column("ID")]
        public int Id { get; set; }

        [Column("USER_ID")]
        public int UserId { get; set; }

        [Column("TARGET_TYPE")]
        public string TargetType { get; set; } = null!;

        [Column("TARGET_ID")]
        public int TargetId { get; set; }

        [Column("REACTION_TYPE")]
        public string ReactionType { get; set; } = null!;

        [Column("CREATED_AT")]
        public DateTime? CreatedAt { get; set; }

        // Navigation property
        [ForeignKey("UserId")]
        public virtual Account User { get; set; } = null!;
    }
}
