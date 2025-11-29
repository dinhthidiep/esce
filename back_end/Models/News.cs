using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESCE_SYSTEM.Models
{
    public class News
    {
        public int Id { get; set; }

        [Required]
        public int AccountId { get; set; }

        [Required]
        [MaxLength(255)]
        public string Title { get; set; } = string.Empty;

        public DateTime CreatedDate { get; set; } = DateTime.Now;

        [MaxLength(500)]
        public string? Image { get; set; }

        [MaxLength(500)]
        public string? SocialMediaLink { get; set; }

        [ForeignKey("AccountId")]
        public virtual Account Account { get; set; } = null!;
    }
}
