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
        public DbSet<Payment> Payments { get; set; }
        public DbSet<Post> Posts { get; set; }
        public DbSet<Comment> Comments { get; set; }
        public DbSet<Postreaction> Postreactions { get; set; }
        public DbSet<Commentreaction> Commentreactions { get; set; }
        public DbSet<Postsave> Postsaves { get; set; }
        public DbSet<Message> Messages { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<AgencieCertificate> AgencieCertificates { get; set; }
        public DbSet<HostCertificate> HostCertificates { get; set; }
        public DbSet<Otp> Otps { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

			// Map Account to legacy SQL table/columns
			modelBuilder.Entity<Account>(entity =>
			{
				entity.ToTable("ACCOUNTS");
				entity.Property(a => a.Id).HasColumnName("ID");
				entity.Property(a => a.Name).HasColumnName("NAME");
				entity.Property(a => a.Email).HasColumnName("EMAIL");
				entity.Property(a => a.PasswordHash).HasColumnName("PASSWORD_HASH");
				entity.Ignore(a => a.PasswordSalt); // no column in DB
				entity.Property(a => a.Avatar)
					.HasColumnName("AVATAR")
					.HasColumnType("nvarchar(max)"); // Allow storing large base64 images
				entity.Property(a => a.Phone).HasColumnName("PHONE");
				entity.Property(a => a.Dob).HasColumnName("DOB");
				entity.Property(a => a.Gender).HasColumnName("GENDER");
				entity.Property(a => a.Address).HasColumnName("ADDRESS");
				entity.Property(a => a.IsActive).HasColumnName("IS_ACTIVE");
				entity.Property(a => a.CreatedAt).HasColumnName("CREATED_AT");
				entity.Property(a => a.UpdatedAt).HasColumnName("UPDATED_AT");
				entity.Property(a => a.RoleId).HasColumnName("ROLE_ID");
				entity.Property(a => a.IsBanned).HasColumnName("IsBanned");
				entity.Ignore(a => a.Name2); // not present in DB
			});

			// Map Role to legacy SQL table/columns
			modelBuilder.Entity<Role>(entity =>
			{
				entity.ToTable("ROLES");
				entity.Property(r => r.Id).HasColumnName("ID");
				entity.Property(r => r.Name).HasColumnName("NAME");
				entity.Property(r => r.Description).HasColumnName("DESCRIPTION");
			});

			// Map ServiceCombo to legacy table name
			modelBuilder.Entity<ServiceCombo>(entity =>
			{
				entity.ToTable("SERVICECOMBO");
				entity.Property(sc => sc.Id).HasColumnName("ID");
				entity.Property(sc => sc.Name).HasColumnName("NAME");
				entity.Property(sc => sc.Address).HasColumnName("ADDRESS");
				entity.Property(sc => sc.Description).HasColumnName("DESCRIPTION");
				entity.Property(sc => sc.Price).HasColumnName("PRICE");
				entity.Property(sc => sc.AvailableSlots).HasColumnName("AVAILABLE_SLOTS");
				entity.Property(sc => sc.Image).HasColumnName("IMAGE");
				entity.Property(sc => sc.Status).HasColumnName("STATUS");
				entity.Property(sc => sc.CancellationPolicy).HasColumnName("CANCELLATION_POLICY");
				entity.Property(sc => sc.CreatedAt).HasColumnName("CREATED_AT");
				entity.Property(sc => sc.UpdatedAt).HasColumnName("UPDATED_AT");
				entity.Property(sc => sc.HostId).HasColumnName("HOST_ID");
			});

			// Map ServiceComboDetail to legacy table name
			modelBuilder.Entity<ServiceComboDetail>(entity =>
			{
				entity.ToTable("SERVICECOMBO_DETAIL");
				entity.Property(scd => scd.Id).HasColumnName("ID");
				entity.Property(scd => scd.ServiceComboId).HasColumnName("SERVICECOMBO_ID");
				entity.Property(scd => scd.ServiceId).HasColumnName("SERVICE_ID");
				entity.Property(scd => scd.Quantity).HasColumnName("QUANTITY");
			});

			// Map Service to legacy table name
			modelBuilder.Entity<Service>(entity =>
			{
				entity.ToTable("SERVICE");
				entity.Property(s => s.Id).HasColumnName("ID");
				entity.Property(s => s.Name).HasColumnName("NAME");
				entity.Property(s => s.Description).HasColumnName("DESCRIPTION");
				entity.Property(s => s.Price).HasColumnName("PRICE");
				entity.Property(s => s.HostId).HasColumnName("HOST_ID");
				entity.Property(s => s.Created_At).HasColumnName("CREATED_AT");
				entity.Property(s => s.Updated_At).HasColumnName("UPDATED_AT");
			});

			// Map Coupon to legacy table name
			modelBuilder.Entity<Coupon>(entity =>
			{
				entity.ToTable("COUPONS");
				entity.Property(c => c.Id).HasColumnName("ID");
				entity.Property(c => c.Code).HasColumnName("CODE");
				entity.Property(c => c.Description).HasColumnName("DESCRIPTION");
				entity.Property(c => c.DiscountPercent).HasColumnName("DISCOUNT_PERCENT");
				entity.Property(c => c.DiscountAmount).HasColumnName("DISCOUNT_AMOUNT");
				entity.Property(c => c.UsageLimit).HasColumnName("USAGE_LIMIT");
				entity.Property(c => c.UsageCount).HasColumnName("USAGE_COUNT");
				entity.Property(c => c.HostId).HasColumnName("HOST_ID");
				entity.Property(c => c.ServiceComboId).HasColumnName("SERVICECOMBO_ID");
				entity.Property(c => c.IsActive).HasColumnName("IS_ACTIVE");
				entity.Property(c => c.CreatedAt).HasColumnName("CREATED_AT");
				entity.Property(c => c.UpdatedAt).HasColumnName("UPDATED_AT");
			});

			// Map Booking to legacy table name
			modelBuilder.Entity<Booking>(entity =>
			{
				entity.ToTable("BOOKINGS");
				entity.Property(b => b.Id).HasColumnName("ID");
				entity.Property(b => b.UserId).HasColumnName("USER_ID");
				entity.Property(b => b.ServiceComboId).HasColumnName("COMBO_ID");
				entity.Property(b => b.Quantity).HasColumnName("QUANTITY");
				entity.Property(b => b.TotalAmount).HasColumnName("TOTAL_AMOUNT");
				entity.Property(b => b.Status).HasColumnName("STATUS");
				entity.Property(b => b.Notes).HasColumnName("NOTES");
				entity.Property(b => b.BookingDate).HasColumnName("BOOKING_DATE");
				
				// Ignore properties that don't exist in the database
				entity.Ignore(b => b.BookingNumber);
				entity.Ignore(b => b.ServiceId);
				entity.Ignore(b => b.UnitPrice);
				entity.Ignore(b => b.ItemType);
				entity.Ignore(b => b.ConfirmedDate);
				entity.Ignore(b => b.CompletedDate);
				entity.Ignore(b => b.CreatedAt);
				entity.Ignore(b => b.UpdatedAt);
				
				// Ignore Service navigation property - database doesn't have SERVICE_ID column
				// This prevents EF Core from creating shadow properties like ServiceId1
				entity.Ignore(b => b.Service);
				
				// Note: START_DATE and END_DATE exist in DB but not in model - ignoring for now
			});

			// Map Post to legacy table name
			modelBuilder.Entity<Post>(entity =>
			{
				entity.ToTable("POSTS");
				entity.Property(p => p.Id).HasColumnName("ID");
				entity.Property(p => p.Title).HasColumnName("TITLE");
				entity.Property(p => p.Content).HasColumnName("CONTENT");
				entity.Property(p => p.AuthorId).HasColumnName("AUTHOR_ID");
				entity.Property(p => p.Image)
					.HasColumnName("IMAGE")
					.HasColumnType("nvarchar(max)"); // Allow storing large base64 images
				entity.Property(p => p.CreatedAt).HasColumnName("CREATED_AT");
				entity.Property(p => p.UpdatedAt).HasColumnName("UPDATED_AT");
				entity.Property(p => p.Status).HasColumnName("Status");
				entity.Property(p => p.RejectComment).HasColumnName("RejectComment");
				entity.Property(p => p.ReviewComments).HasColumnName("ReviewComments");
				entity.Property(p => p.IsDeleted).HasColumnName("IsDeleted");
				entity.Property(p => p.CommentsCount).HasColumnName("CommentsCount");
				entity.Property(p => p.ReactionsCount).HasColumnName("ReactionsCount");
				entity.Property(p => p.SavesCount).HasColumnName("SavesCount");
			});

			// Map Comment to legacy table name
			modelBuilder.Entity<Comment>(entity =>
			{
				entity.ToTable("COMMENTS");
				entity.Property(c => c.Id).HasColumnName("ID");
				entity.Property(c => c.PostId).HasColumnName("POST_ID");
				entity.Property(c => c.AuthorId).HasColumnName("AUTHOR_ID");
				entity.Property(c => c.ParentCommentId).HasColumnName("PARENT_COMMENT_ID");
				entity.Property(c => c.Content).HasColumnName("CONTENT");
				entity.Property(c => c.CreatedAt).HasColumnName("CREATED_AT");
				entity.Property(c => c.Image)
					.HasColumnName("IMAGE")
					.HasColumnType("nvarchar(max)"); // Allow storing large base64 images
				entity.Property(c => c.UpdatedAt).HasColumnName("UpdatedAt");
				entity.Property(c => c.ReactionsCount).HasColumnName("ReactionsCount");
				entity.Property(c => c.IsDeleted).HasColumnName("IsDeleted");
			});

			// Map Postreaction to legacy table name
			modelBuilder.Entity<Postreaction>(entity =>
			{
				entity.ToTable("POSTREACTIONS");
				entity.Property(pr => pr.Id).HasColumnName("Id");
				entity.Property(pr => pr.UserId).HasColumnName("UserId");
				entity.Property(pr => pr.PostId).HasColumnName("PostId");
				entity.Property(pr => pr.ReactionTypeId).HasColumnName("ReactionTypeId");
				entity.Property(pr => pr.CreatedAt).HasColumnName("CreatedAt");
			});

			// Map Postsave to legacy table name
			modelBuilder.Entity<Postsave>(entity =>
			{
				entity.ToTable("POSTSAVES");
				entity.Property(ps => ps.Id).HasColumnName("Id");
				entity.Property(ps => ps.PostId).HasColumnName("PostId");
				entity.Property(ps => ps.AccountId).HasColumnName("AccountId");
				entity.Property(ps => ps.SavedAt).HasColumnName("SavedAt");
			});

			// Map Notification to legacy table name
			modelBuilder.Entity<Notification>(entity =>
			{
				entity.ToTable("NOTIFICATIONS");
				entity.Property(n => n.Id).HasColumnName("ID");
				entity.Property(n => n.UserId).HasColumnName("USER_ID");
				entity.Property(n => n.Title).HasColumnName("TITLE");
				entity.Property(n => n.Message).HasColumnName("MESSAGE");
				entity.Property(n => n.IsRead).HasColumnName("IS_READ");
				entity.Property(n => n.CreatedAt).HasColumnName("CREATED_AT");
			});

			// Map ReactionType to legacy table name (if needed for queries)
			// Note: ReactionType might not have a DbSet, but we map it for relationship configuration
			modelBuilder.Entity<ReactionType>(entity =>
			{
				entity.ToTable("REACTION_TYPES");
				entity.Property(rt => rt.Id).HasColumnName("ID");
				entity.Property(rt => rt.Name).HasColumnName("Name");
			});

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

            // Note: Booking->Service relationship removed because ServiceId column doesn't exist in database
            // The database only has COMBO_ID, not SERVICE_ID
            // If Service relationship is needed in the future, the database schema would need to be updated

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

            // Configure Post relationships
            modelBuilder.Entity<Post>()
                .HasOne(p => p.Author)
                .WithMany()
                .HasForeignKey(p => p.AuthorId)
                .HasPrincipalKey(a => a.Id)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure Comment relationships
            modelBuilder.Entity<Comment>()
                .HasOne(c => c.Post)
                .WithMany(p => p.Comments)
                .HasForeignKey(c => c.PostId)
                .HasPrincipalKey(p => p.Id)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Comment>()
                .HasOne(c => c.Author)
                .WithMany()
                .HasForeignKey(c => c.AuthorId)
                .HasPrincipalKey(a => a.Id)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Comment>()
                .HasOne(c => c.ParentComment)
                .WithMany(c => c.InverseParentComment)
                .HasForeignKey(c => c.ParentCommentId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure Postreaction relationships
            modelBuilder.Entity<Postreaction>()
                .HasOne(pr => pr.Post)
                .WithMany(p => p.Postreactions)
                .HasForeignKey(pr => pr.PostId)
                .HasPrincipalKey(p => p.Id)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Postreaction>()
                .HasOne(pr => pr.User)
                .WithMany()
                .HasForeignKey(pr => pr.UserId)
                .HasPrincipalKey(a => a.Id)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Postreaction>()
                .HasOne(pr => pr.ReactionType)
                .WithMany(rt => rt.Postreactions)
                .HasForeignKey(pr => pr.ReactionTypeId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure Postsave relationships
            modelBuilder.Entity<Postsave>()
                .HasOne(ps => ps.Post)
                .WithMany(p => p.Postsaves)
                .HasForeignKey(ps => ps.PostId)
                .HasPrincipalKey(p => p.Id)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Postsave>()
                .HasOne(ps => ps.Account)
                .WithMany()
                .HasForeignKey(ps => ps.AccountId)
                .HasPrincipalKey(a => a.Id)
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
