﻿using System;
using System.Collections.Generic;

namespace ESCE_SYSTEM.Models
{
    public partial class Account
    {
        public Account()
        {
            AgencieCertificates = new HashSet<AgencieCertificate>();
            Bookings = new HashSet<Booking>();
            Comments = new HashSet<Comment>();
            Coupons = new HashSet<Coupon>();
            HostCertificates = new HashSet<HostCertificate>();
            Messages = new HashSet<Message>();
            News = new HashSet<News>();
            Notifications = new HashSet<Notification>();
            Otps = new HashSet<Otp>();
            PostSaves = new HashSet<PostSave>();
            Posts = new HashSet<Post>();
            Reactions = new HashSet<Reaction>();
            RequestSupports = new HashSet<RequestSupport>();
            Reviews = new HashSet<Review>();
            Servicecombos = new HashSet<Servicecombo>();
            Services = new HashSet<Service>();
            SupportResponses = new HashSet<SupportResponse>();
        }

        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string PasswordHash { get; set; } = null!;
        public string? Password { get; set; }
        public string? Avatar { get; set; }
        public string? Phone { get; set; }
        public DateTime? Dob { get; set; }
        public string? Gender { get; set; }
        public string? Address { get; set; }
        public bool? IsActive { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int RoleId { get; set; }
        public bool IsBanned { get; set; }

        public virtual Role Role { get; set; } = null!;
        public virtual ICollection<AgencieCertificate> AgencieCertificates { get; set; }
        public virtual ICollection<Booking> Bookings { get; set; }
        public virtual ICollection<Comment> Comments { get; set; }
        public virtual ICollection<Coupon> Coupons { get; set; }
        public virtual ICollection<HostCertificate> HostCertificates { get; set; }
        public virtual ICollection<Message> Messages { get; set; }
        public virtual ICollection<News> News { get; set; }
        public virtual ICollection<Notification> Notifications { get; set; }
        public virtual ICollection<Otp> Otps { get; set; }
        public virtual ICollection<PostSave> PostSaves { get; set; }
        public virtual ICollection<Post> Posts { get; set; }
        public virtual ICollection<Reaction> Reactions { get; set; }
        public virtual ICollection<RequestSupport> RequestSupports { get; set; }
        public virtual ICollection<Review> Reviews { get; set; }
        public virtual ICollection<Servicecombo> Servicecombos { get; set; }
        public virtual ICollection<Service> Services { get; set; }
        public virtual ICollection<SupportResponse> SupportResponses { get; set; }
    }
}
