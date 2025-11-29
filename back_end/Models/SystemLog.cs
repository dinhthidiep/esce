using System;
using System.Collections.Generic;

namespace ESCE_SYSTEM.Models
{
    public partial class SystemLog
    {
        public int LogId { get; set; }
        public string? LogLevel { get; set; }
        public string? Message { get; set; }
        public string? StackTrace { get; set; }
        public DateTime? CreatedAt { get; set; }
        public int? UserId { get; set; }
        public string? Module { get; set; }
    }
}
