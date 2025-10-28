using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Learnasp.Models
{
    public class News
    {
        [Key]
        [Column("NewsId")]
        public int Id { get; set; }

        [Required]
        [Column("AccountId")]
        public int AccountId { get; set; }

        [Required]
        [MaxLength(255)]
        [Column("NewsTitle")]
        public string Title { get; set; } = string.Empty;

        [Column("CreatedDate")]
        public DateTime CreatedDate { get; set; } = DateTime.Now;

        [MaxLength(500)]
        [Column("Image")]
        public string? Image { get; set; }

        [MaxLength(500)]
        [Column("SocialMediaLink")]
        public string? SocialMediaLink { get; set; }

        // Navigation properties
        [ForeignKey("AccountId")]
        public virtual Account Account { get; set; } = null!;
    }
}


