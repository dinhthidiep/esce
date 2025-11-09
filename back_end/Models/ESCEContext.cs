using Microsoft.EntityFrameworkCore;

namespace ESCE_SYSTEM.Models
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
        
        public DbSet<Service> Services { get; set; } = null!;
        public DbSet<Account> Accounts { get; set; } = null!;
        public DbSet<Role> Roles { get; set; } = null!;
        public DbSet<ServiceCombo> ServiceCombos { get; set; } = null!;
        public DbSet<ServiceComboDetail> ServiceComboDetails { get; set; } = null!;
        public DbSet<Coupon> Coupons { get; set; } = null!;
        public DbSet<Booking> Bookings { get; set; } = null!;
        public DbSet<BookingCoupon> BookingCoupons { get; set; } = null!;
        public DbSet<News> News { get; set; } = null!;
        public DbSet<SystemLog> SystemLogs { get; set; } = null!;
        public DbSet<Review> Reviews { get; set; } = null!;
        public DbSet<Payment> Payments { get; set; } = null!;
        public DbSet<Otp> Otps { get; set; } = null!;
        public DbSet<Message> Messages { get; set; } = null!;
        public DbSet<Notification> Notifications { get; set; } = null!;
        public DbSet<Post> Posts { get; set; } = null!;
        public DbSet<Comment> Comments { get; set; } = null!;
        public DbSet<Reaction> Reactions { get; set; } = null!;
        public DbSet<AgencieCertificate> AgencieCertificates { get; set; } = null!;
        public DbSet<HostCertificate> HostCertificates { get; set; } = null!;

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
                .HasOne(sc => sc.Host)
                .WithMany(a => a.ServiceCombos)
                .HasForeignKey(sc => sc.HostId);

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

            // Configure Coupon entity column mappings to match database schema
            modelBuilder.Entity<Coupon>(entity =>
            {
                entity.ToTable("COUPONS");
                
                entity.Property(e => e.Id)
                    .HasColumnName("ID");
                
                entity.Property(e => e.Code)
                    .HasColumnName("CODE")
                    .HasMaxLength(50)
                    .IsRequired();
                
                entity.Property(e => e.Description)
                    .HasColumnName("DESCRIPTION")
                    .HasMaxLength(255);
                
                entity.Property(e => e.DiscountPercent)
                    .HasColumnName("DISCOUNT_PERCENT")
                    .HasColumnType("decimal(5,2)");
                
                entity.Property(e => e.DiscountAmount)
                    .HasColumnName("DISCOUNT_AMOUNT")
                    .HasColumnType("decimal(18,2)");
                
                entity.Property(e => e.UsageLimit)
                    .HasColumnName("USAGE_LIMIT")
                    .IsRequired();
                
                entity.Property(e => e.UsageCount)
                    .HasColumnName("USAGE_COUNT");
                
                entity.Property(e => e.HostId)
                    .HasColumnName("HOST_ID")
                    .IsRequired();
                
                entity.Property(e => e.ServiceComboId)
                    .HasColumnName("SERVICECOMBO_ID")
                    .IsRequired();
                
                entity.Property(e => e.IsActive)
                    .HasColumnName("IS_ACTIVE");
                
                entity.Property(e => e.CreatedAt)
                    .HasColumnName("CREATED_AT");
                
                entity.Property(e => e.UpdatedAt)
                    .HasColumnName("UPDATED_AT");
                
                entity.HasOne(c => c.Host)
                    .WithMany(a => a.Coupons)
                    .HasForeignKey(c => c.HostId)
                    .OnDelete(DeleteBehavior.Restrict);
                
                entity.HasOne(c => c.ServiceCombo)
                    .WithMany()
                    .HasForeignKey(c => c.ServiceComboId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

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

            // Service relationship removed - ServiceId doesn't exist in database schema
            // The BOOKINGS table only has COMBO_ID, not SERVICE_ID

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

            // Configure AgencieCertificate primary key and relationships
            modelBuilder.Entity<AgencieCertificate>()
                .HasKey(ac => ac.AgencyId);

            modelBuilder.Entity<AgencieCertificate>()
                .HasOne(ac => ac.Account)
                .WithMany()
                .HasForeignKey(ac => ac.AccountId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure HostCertificate primary key and relationships
            modelBuilder.Entity<HostCertificate>()
                .HasKey(hc => hc.CertificateId);

            modelBuilder.Entity<HostCertificate>()
                .HasOne(hc => hc.Host)
                .WithMany()
                .HasForeignKey(hc => hc.HostId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure Post-Account (Author) relationship
            modelBuilder.Entity<Post>(entity =>
            {
                entity.ToTable("POSTS");
                entity.Property(e => e.Id).HasColumnName("ID");
                entity.Property(e => e.AuthorId).HasColumnName("AUTHOR_ID");
                entity.Property(e => e.CreatedAt).HasColumnName("CREATED_AT");
                entity.Property(e => e.Title).HasColumnName("TITLE").IsRequired();
                entity.Property(e => e.Content).HasColumnName("CONTENT").IsRequired();
                entity.Property(e => e.Image).HasColumnName("Image").IsRequired(false);
                entity.Property(e => e.UpdatedAt).HasColumnName("UPDATED_AT");

                entity.HasOne(p => p.Author)
                    .WithMany(a => a.Posts)
                    .HasForeignKey(p => p.AuthorId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Configure Reaction entity column mappings
            modelBuilder.Entity<Reaction>(entity =>
            {
                entity.ToTable("REACTIONS");
                entity.Property(e => e.Id).HasColumnName("ID");
                entity.Property(e => e.UserId).HasColumnName("USER_ID");
                entity.Property(e => e.TargetType).HasColumnName("TARGET_TYPE");
                entity.Property(e => e.TargetId).HasColumnName("TARGET_ID");
                entity.Property(e => e.ReactionType).HasColumnName("REACTION_TYPE");
                entity.Property(e => e.CreatedAt).HasColumnName("CREATED_AT");

                entity.HasOne(r => r.User)
                    .WithMany(a => a.Reactions)
                    .HasForeignKey(r => r.UserId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Configure Comment entity column mappings
            modelBuilder.Entity<Comment>(entity =>
            {
                entity.ToTable("COMMENTS");
                entity.Property(e => e.Id).HasColumnName("ID");
                entity.Property(e => e.PostId).HasColumnName("POST_ID");
                entity.Property(e => e.AuthorId).HasColumnName("AUTHOR_ID");
                entity.Property(e => e.ParentCommentId).HasColumnName("PARENT_COMMENT_ID");
                entity.Property(e => e.Content).HasColumnName("CONTENT");
                entity.Property(e => e.CreatedAt).HasColumnName("CREATED_AT");
                entity.Property(e => e.Image).HasColumnName("Image").IsRequired(false);

                entity.HasOne(c => c.Author)
                    .WithMany()
                    .HasForeignKey(c => c.AuthorId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(c => c.Post)
                    .WithMany()
                    .HasForeignKey(c => c.PostId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(c => c.ParentComment)
                    .WithMany(c => c.InverseParentComment)
                    .HasForeignKey(c => c.ParentCommentId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

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
