using Microsoft.EntityFrameworkCore;

namespace ESCE_SYSTEM.Models
{
    public class ESCEContext : DbContext
    {
        public ESCEContext(DbContextOptions<ESCEContext> options) : base(options) { }

        // DbSets
        public DbSet<Account> Accounts { get; set; } = null!;
        public DbSet<Role> Roles { get; set; } = null!;
        public DbSet<Service> Services { get; set; } = null!;
        public DbSet<ServiceCombo> ServiceCombos { get; set; } = null!;
        public DbSet<ServiceComboDetail> ServiceComboDetails { get; set; } = null!;
        public DbSet<Booking> Bookings { get; set; } = null!;
        public DbSet<BookingCoupon> BookingCoupons { get; set; } = null!;
        public DbSet<Coupon> Coupons { get; set; } = null!;
        public DbSet<Payment> Payments { get; set; } = null!;
        public DbSet<Review> Reviews { get; set; } = null!;
        public DbSet<News> News { get; set; } = null!;
        public DbSet<SystemLog> SystemLogs { get; set; } = null!;
        
        // Existing from main
        public DbSet<AgencieCertificate> AgencieCertificates { get; set; } = null!;
        public DbSet<Comment> Comments { get; set; } = null!;
        public DbSet<Commentreaction> Commentreactions { get; set; } = null!;
        public DbSet<HostCertificate> HostCertificates { get; set; } = null!;
        public DbSet<Message> Messages { get; set; } = null!;
        public DbSet<Notification> Notifications { get; set; } = null!;
        public DbSet<Otp> Otps { get; set; } = null!;
        public DbSet<Post> Posts { get; set; } = null!;
        public DbSet<Postreaction> Postreactions { get; set; } = null!;
        public DbSet<Postsave> Postsaves { get; set; } = null!;
        public DbSet<Reaction> Reactions { get; set; } = null!;
        public DbSet<ReactionType> ReactionTypes { get; set; } = null!;
        public DbSet<RequestSupport> RequestSupports { get; set; } = null!;
        public DbSet<SupportResponse> SupportResponses { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Account - Role relationship
            modelBuilder.Entity<Account>()
                .HasOne(a => a.Role)
                .WithMany(r => r.Accounts)
                .HasForeignKey(a => a.RoleId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Account>()
                .HasIndex(a => a.Email)
                .IsUnique();

            // Service - Host relationship
            modelBuilder.Entity<Service>()
                .HasOne(s => s.Host)
                .WithMany()
                .HasForeignKey(s => s.HostId)
                .OnDelete(DeleteBehavior.Restrict);

            // ServiceCombo - Host relationship
            modelBuilder.Entity<ServiceCombo>()
                .HasOne(sc => sc.Host)
                .WithMany()
                .HasForeignKey(sc => sc.HostId)
                .OnDelete(DeleteBehavior.Restrict);

            // ServiceComboDetail relationships
            modelBuilder.Entity<ServiceComboDetail>()
                .HasOne(scd => scd.ServiceCombo)
                .WithMany(sc => sc.ServiceComboDetails)
                .HasForeignKey(scd => scd.ServiceComboId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ServiceComboDetail>()
                .HasOne(scd => scd.Service)
                .WithMany(s => s.ServiceComboDetails)
                .HasForeignKey(scd => scd.ServiceId)
                .OnDelete(DeleteBehavior.Restrict);

            // Coupon relationships
            modelBuilder.Entity<Coupon>()
                .HasOne(c => c.Host)
                .WithMany()
                .HasForeignKey(c => c.HostId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Coupon>()
                .HasOne(c => c.ServiceCombo)
                .WithMany()
                .HasForeignKey(c => c.ServiceComboId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Coupon>()
                .HasIndex(c => c.Code)
                .IsUnique();

            // Booking relationships
            modelBuilder.Entity<Booking>()
                .HasOne(b => b.User)
                .WithMany(a => a.Bookings)
                .HasForeignKey(b => b.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Booking>()
                .HasOne(b => b.ServiceCombo)
                .WithMany()
                .HasForeignKey(b => b.ServiceComboId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Booking>()
                .HasOne(b => b.Service)
                .WithMany()
                .HasForeignKey(b => b.ServiceId)
                .OnDelete(DeleteBehavior.Restrict);

            // BookingCoupon relationships
            modelBuilder.Entity<BookingCoupon>()
                .HasOne(bc => bc.Booking)
                .WithMany(b => b.BookingCoupons)
                .HasForeignKey(bc => bc.BookingId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<BookingCoupon>()
                .HasOne(bc => bc.Coupon)
                .WithMany(c => c.BookingCoupons)
                .HasForeignKey(bc => bc.CouponId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<BookingCoupon>()
                .HasIndex(bc => new { bc.BookingId, bc.CouponId })
                .IsUnique();

            // Payment relationships
            modelBuilder.Entity<Payment>()
                .HasOne(p => p.Booking)
                .WithMany(b => b.Payments)
                .HasForeignKey(p => p.BookingId)
                .OnDelete(DeleteBehavior.Cascade);

            // Review relationships
            modelBuilder.Entity<Review>()
                .HasOne(r => r.Booking)
                .WithMany(b => b.Reviews)
                .HasForeignKey(r => r.BookingId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Review>()
                .HasOne(r => r.User)
                .WithMany()
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // News relationships
            modelBuilder.Entity<News>()
                .HasOne(n => n.Account)
                .WithMany()
                .HasForeignKey(n => n.AccountId)
                .OnDelete(DeleteBehavior.Restrict);

            // SystemLog relationships
            modelBuilder.Entity<SystemLog>()
                .HasOne(log => log.User)
                .WithMany()
                .HasForeignKey(log => log.UserId)
                .OnDelete(DeleteBehavior.SetNull);

            // Role unique constraint
            modelBuilder.Entity<Role>()
                .HasIndex(r => r.Name)
                .IsUnique();
        }
    }
}
