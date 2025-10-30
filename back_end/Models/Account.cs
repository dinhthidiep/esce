using ESCE_SYSTEM.Models;
using System;
using System.Collections.Generic;

namespace ESCE_SYSTEM.Models
{
    public partial class Account
    {
        public Account()
        {
            Bookings = new HashSet<Booking>();
            Reviews = new HashSet<Review>();
            SystemLogs = new HashSet<SystemLog>();
            Coupons = new HashSet<Coupon>();
            News = new HashSet<News>();
        }

        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string PasswordHash { get; set; } = null!;
        public string? PasswordSalt { get; set; }
        public string? Avatar { get; set; }
        public string? Phone { get; set; }
        public DateTime? Dob { get; set; }
        public string? Gender { get; set; }
        public string? Address { get; set; }
        public bool? IsActive { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int RoleId { get; set; }
        public string? Name2 { get; set; }

        public virtual Role Role { get; set; } = null!;
        public virtual ICollection<Booking> Bookings { get; set; }
        public virtual ICollection<Review> Reviews { get; set; }
        public virtual ICollection<SystemLog> SystemLogs { get; set; }
        public virtual ICollection<Coupon> Coupons { get; set; }
        public virtual ICollection<News> News { get; set; }
    }
}
