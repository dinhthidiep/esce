using System;
using System.Collections.Generic;

namespace ESCE_SYSTEM.Models
{
    public partial class Account
    {
        public Account()
        {
            Bookings = new HashSet<Booking>();
            Comments = new HashSet<Comment>();
            ComplaintActions = new HashSet<ComplaintAction>();
            Complaints = new HashSet<Complaint>();
            GroupBookings = new HashSet<GroupBooking>();
            GroupMembers = new HashSet<GroupMember>();
            MessageReceivers = new HashSet<Message>();
            MessageSenders = new HashSet<Message>();
            Notifications = new HashSet<Notification>();
            Otps = new HashSet<Otp>();
            Posts = new HashSet<Post>();
            Promotions = new HashSet<Promotion>();
            Reactions = new HashSet<Reaction>();
            RequestSupports = new HashSet<RequestSupport>();
            Reviews = new HashSet<Review>();
            Tours = new HashSet<Tour>();
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

        public virtual Role Role { get; set; } = null!;
        public virtual ICollection<Booking> Bookings { get; set; }
        public virtual ICollection<Comment> Comments { get; set; }
        public virtual ICollection<ComplaintAction> ComplaintActions { get; set; }
        public virtual ICollection<Complaint> Complaints { get; set; }
        public virtual ICollection<GroupBooking> GroupBookings { get; set; }
        public virtual ICollection<GroupMember> GroupMembers { get; set; }
        public virtual ICollection<Message> MessageReceivers { get; set; }
        public virtual ICollection<Message> MessageSenders { get; set; }
        public virtual ICollection<Notification> Notifications { get; set; }
        public virtual ICollection<Otp> Otps { get; set; }
        public virtual ICollection<Post> Posts { get; set; }
        public virtual ICollection<Promotion> Promotions { get; set; }
        public virtual ICollection<Reaction> Reactions { get; set; }
        public virtual ICollection<RequestSupport> RequestSupports { get; set; }
        public virtual ICollection<Review> Reviews { get; set; }
        public virtual ICollection<Tour> Tours { get; set; }
    }
}
