using Microsoft.EntityFrameworkCore;

namespace Learnasp.Models
{
    public class ESCEContext:DbContext
    {
        public ESCEContext(DbContextOptions<ESCEContext> options) : base (options) {}
        
        // Vô hiệu hóa migrations - sử dụng Database.EnsureCreated() thay vì migrations
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                // Cấu hình này sẽ được override bởi Program.cs
            }
        }
        
        public DbSet<Service> Services { get; set; }
        public DbSet<Account> Accounts { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<ServiceCombo> ServiceCombos { get; set; }
        public DbSet<ServiceComboDetail> ServiceComboDetails { get; set; }
        public DbSet<Coupon> Coupons { get; set; }
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<BookingCoupon> BookingCoupons { get; set; }
        public DbSet<News> News { get; set; }
        public DbSet<SystemLog> SystemLogs { get; set; }
        public DbSet<Review> Reviews { get; set; }
        // Payment sẽ được xử lý bởi người khác
        // public DbSet<Payment> Payments { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Account-Role relationship
            modelBuilder.Entity<Account>()
                .HasOne(a => a.Role)
                .WithMany(r => r.Accounts)
                .HasForeignKey(a => a.RoleId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure Service-Account (Host) relationship
            modelBuilder.Entity<Service>()
                .HasOne<Account>()
                .WithMany()
                .HasForeignKey(s => s.HostId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure ServiceCombo-Account (Host) relationship
            modelBuilder.Entity<ServiceCombo>()
                .HasOne<Account>()
                .WithMany()
                .HasForeignKey(sc => sc.HostId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure ServiceComboDetail relationships
            modelBuilder.Entity<ServiceComboDetail>()
                .HasOne(scd => scd.ServiceCombo)
                .WithMany(sc => sc.ServiceComboDetails)
                .HasForeignKey(scd => scd.ServiceComboId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ServiceComboDetail>()
                .HasOne(scd => scd.Service)
                .WithMany()
                .HasForeignKey(scd => scd.ServiceId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure Coupon relationships
            modelBuilder.Entity<Coupon>()
                .HasOne(c => c.Host)
                .WithMany(a => a.Coupons)
                .HasForeignKey(c => c.HostId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Coupon>()
                .HasOne(c => c.ServiceCombo)
                .WithMany()
                .HasForeignKey(c => c.ServiceComboId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure Booking relationships
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

            // Configure BookingCoupon relationships
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

            // Configure Payment relationships (sẽ được xử lý bởi người khác)

            // Configure News relationships
            modelBuilder.Entity<News>()
                .HasOne(n => n.Account)
                .WithMany(a => a.News)
                .HasForeignKey(n => n.AccountId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure SystemLog relationships
            modelBuilder.Entity<SystemLog>()
                .HasOne(log => log.User)
                .WithMany(a => a.SystemLogs)
                .HasForeignKey(log => log.UserId)
                .OnDelete(DeleteBehavior.SetNull);

            // Configure Review relationships
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

            // Configure unique constraints
            modelBuilder.Entity<Role>()
                .HasIndex(r => r.Name)
                .IsUnique();

            modelBuilder.Entity<Account>()
                .HasIndex(a => a.Email)
                .IsUnique();

            modelBuilder.Entity<Coupon>()
                .HasIndex(c => c.Code)
                .IsUnique();

            modelBuilder.Entity<BookingCoupon>()
                .HasIndex(bc => new { bc.BookingId, bc.CouponId })
                .IsUnique();
        }
    }
}
