using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESCE_SYSTEM.Models
{
    public class SystemLog
    {
        [Key]
        [Column("LogId")]
        public int Id { get; set; }

        [MaxLength(50)]
        [Column("LogLevel")]
        public string? LogLevel { get; set; } // INFO, WARN, ERROR

        [Column("Message", TypeName = "nvarchar(MAX)")]
        public string? Message { get; set; }

        [Column("StackTrace", TypeName = "nvarchar(MAX)")]
        public string? StackTrace { get; set; }

        [Column("CreatedAt")]
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        [Column("UserId")]
        public int? UserId { get; set; }

        [MaxLength(100)]
        [Column("Module")]
        public string? Module { get; set; }

        // Navigation properties
        [ForeignKey("UserId")]
        public virtual Account? User { get; set; }
    }
}



