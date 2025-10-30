using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESCE_SYSTEM.Models
{
    public class Review
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [Column("BookingId")]
        public int BookingId { get; set; }

        [Required]
        [Column("UserId")]
        public int UserId { get; set; }

        [Required]
        [Range(1, 5)]
        [Column("Rating")]
        public int Rating { get; set; } // 1-5 sao

        [MaxLength(1000)]
        [Column("Comment")]
        public string? Comment { get; set; }

        [Column("CreatedDate")]
        public DateTime CreatedDate { get; set; } = DateTime.Now;

        [MaxLength(50)]
        [Column("Status")]
        public string Status { get; set; } = "pending"; // pending / approved / rejected

        // Navigation properties
        [ForeignKey("BookingId")]
        public virtual Booking Booking { get; set; } = null!;

        [ForeignKey("UserId")]
        public virtual Account User { get; set; } = null!;
    }
}


