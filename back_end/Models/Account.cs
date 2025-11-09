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
            Posts = new HashSet<Post>();
            Reactions = new HashSet<Reaction>();
        }

        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string Email { get; set; } = null!;
        [System.ComponentModel.DataAnnotations.Schema.Column("PASSWORD_HASH")]
        public string PasswordHash { get; set; } = null!;
        public string? Avatar { get; set; }
        public string? Phone { get; set; }
        public DateTime? Dob { get; set; }
        public string? Gender { get; set; }
        public string? Address { get; set; }
        [System.ComponentModel.DataAnnotations.Schema.Column("IS_ACTIVE")]
        public bool? IsActive { get; set; }
        [System.ComponentModel.DataAnnotations.Schema.Column("CREATED_AT")]
        public DateTime? CreatedAt { get; set; }
        [System.ComponentModel.DataAnnotations.Schema.Column("UPDATED_AT")]
        public DateTime? UpdatedAt { get; set; }
        [System.ComponentModel.DataAnnotations.Schema.Column("ROLE_ID")]
        public int RoleId { get; set; }
        [System.ComponentModel.DataAnnotations.Schema.Column("IsBanned")]
        public bool? IsBanned { get; set; }

        public virtual Role Role { get; set; } = null!;
        public virtual ICollection<ServiceCombo> ServiceCombos { get; set; } = new HashSet<ServiceCombo>();
        public virtual ICollection<Booking> Bookings { get; set; }
        public virtual ICollection<Review> Reviews { get; set; }
        public virtual ICollection<SystemLog> SystemLogs { get; set; }
        public virtual ICollection<Coupon> Coupons { get; set; }
        public virtual ICollection<News> News { get; set; }
        public virtual ICollection<Post> Posts { get; set; }
        public virtual ICollection<Reaction> Reactions { get; set; }
    }
}
