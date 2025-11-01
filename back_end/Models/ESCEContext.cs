using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;

namespace ESCE_SYSTEM.Models
{
    public partial class ESCEContext : DbContext
    {
        public ESCEContext()
        {
        }

        public ESCEContext(DbContextOptions<ESCEContext> options)
            : base(options)
        {
        }

        public virtual DbSet<Account> Accounts { get; set; } = null!;
        public virtual DbSet<AgencieCertificate> AgencieCertificates { get; set; } = null!;
        public virtual DbSet<Booking> Bookings { get; set; } = null!;
        public virtual DbSet<BookingCoupon> BookingCoupons { get; set; } = null!;
        public virtual DbSet<Comment> Comments { get; set; } = null!;
        public virtual DbSet<Coupon> Coupons { get; set; } = null!;
        public virtual DbSet<HostCertificate> HostCertificates { get; set; } = null!;
        public virtual DbSet<Message> Messages { get; set; } = null!;
        public virtual DbSet<News> News { get; set; } = null!;
        public virtual DbSet<Notification> Notifications { get; set; } = null!;
        public virtual DbSet<Otp> Otps { get; set; } = null!;
        public virtual DbSet<Payment> Payments { get; set; } = null!;
        public virtual DbSet<Post> Posts { get; set; } = null!;
        public virtual DbSet<Reaction> Reactions { get; set; } = null!;
        public virtual DbSet<RequestSupport> RequestSupports { get; set; } = null!;
        public virtual DbSet<Review> Reviews { get; set; } = null!;
        public virtual DbSet<Role> Roles { get; set; } = null!;
        public virtual DbSet<Service> Services { get; set; } = null!;
        public virtual DbSet<Servicecombo> Servicecombos { get; set; } = null!;
        public virtual DbSet<ServicecomboDetail> ServicecomboDetails { get; set; } = null!;
        public virtual DbSet<SupportResponse> SupportResponses { get; set; } = null!;
        public virtual DbSet<SystemLog> SystemLogs { get; set; } = null!;

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see http://go.microsoft.com/fwlink/?LinkId=723263.
                optionsBuilder.UseSqlServer("Server=DESKTOP-68M1JL8\\MSSQLSERVERHUNG;Database=ESCE;Trusted_Connection=True;TrustServerCertificate=True;");
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Account>(entity =>
            {
                entity.ToTable("ACCOUNTS");

                entity.HasIndex(e => e.Email, "UQ__ACCOUNTS__161CF724AB7CCC50")
                    .IsUnique();

                entity.Property(e => e.Id).HasColumnName("ID");

                entity.Property(e => e.Address)
                    .HasMaxLength(255)
                    .HasColumnName("ADDRESS");

                entity.Property(e => e.Avatar)
                    .HasMaxLength(255)
                    .HasColumnName("AVATAR");

                entity.Property(e => e.CreatedAt)
                    .HasColumnType("datetime")
                    .HasColumnName("CREATED_AT")
                    .HasDefaultValueSql("(getdate())");

                entity.Property(e => e.Dob)
                    .HasColumnType("date")
                    .HasColumnName("DOB");

                entity.Property(e => e.Email)
                    .HasMaxLength(100)
                    .HasColumnName("EMAIL");

                entity.Property(e => e.Gender)
                    .HasMaxLength(10)
                    .HasColumnName("GENDER");

                entity.Property(e => e.IsActive)
                    .IsRequired()
                    .HasColumnName("IS_ACTIVE")
                    .HasDefaultValueSql("((1))");

                entity.Property(e => e.Name)
                    .HasMaxLength(100)
                    .HasColumnName("NAME");

                entity.Property(e => e.Password)
                    .HasMaxLength(32)
                    .IsUnicode(false)
                    .HasColumnName("PASSWORD");

                entity.Property(e => e.PasswordHash)
                    .HasMaxLength(500)
                    .IsUnicode(false)
                    .HasColumnName("PASSWORD_HASH");

                entity.Property(e => e.Phone)
                    .HasMaxLength(10)
                    .IsUnicode(false)
                    .HasColumnName("PHONE");

                entity.Property(e => e.RoleId).HasColumnName("ROLE_ID");

                entity.Property(e => e.UpdatedAt)
                    .HasColumnType("datetime")
                    .HasColumnName("UPDATED_AT")
                    .HasDefaultValueSql("(getdate())");

                entity.HasOne(d => d.Role)
                    .WithMany(p => p.Accounts)
                    .HasForeignKey(d => d.RoleId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__ACCOUNTS__ROLE_I__3F466844");
            });

            modelBuilder.Entity<AgencieCertificate>(entity =>
            {
                entity.HasKey(e => e.AgencyId)
                    .HasName("PK__AGENCIE___95C546DBEE22E00D");

                entity.ToTable("AGENCIE_CERTIFICATES");

                entity.Property(e => e.Companyname)
                    .HasMaxLength(255)
                    .HasColumnName("COMPANYNAME");

                entity.Property(e => e.CreatedAt)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getdate())");

                entity.Property(e => e.Email).HasMaxLength(100);

                entity.Property(e => e.LicenseFile).HasMaxLength(500);

                entity.Property(e => e.Phone).HasMaxLength(20);

                entity.Property(e => e.RejectComment).HasMaxLength(1000);

                entity.Property(e => e.ReviewComments).HasMaxLength(1000);

                entity.Property(e => e.Status)
                    .HasMaxLength(50)
                    .HasDefaultValueSql("('pending')");

                entity.Property(e => e.UpdatedAt)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getdate())");

                entity.Property(e => e.Website).HasMaxLength(255);

                entity.HasOne(d => d.Account)
                    .WithMany(p => p.AgencieCertificates)
                    .HasForeignKey(d => d.AccountId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__AGENCIE_C__Accou__4F7CD00D");
            });

            modelBuilder.Entity<Booking>(entity =>
            {
                entity.ToTable("BOOKINGS");

                entity.Property(e => e.Id).HasColumnName("ID");

                entity.Property(e => e.BookingDate)
                    .HasColumnType("datetime")
                    .HasColumnName("BOOKING_DATE")
                    .HasDefaultValueSql("(getdate())");

                entity.Property(e => e.ComboId).HasColumnName("COMBO_ID");

                entity.Property(e => e.EndDate)
                    .HasColumnType("date")
                    .HasColumnName("END_DATE");

                entity.Property(e => e.Notes)
                    .HasMaxLength(500)
                    .HasColumnName("NOTES");

                entity.Property(e => e.Quantity).HasColumnName("QUANTITY");

                entity.Property(e => e.StartDate)
                    .HasColumnType("date")
                    .HasColumnName("START_DATE");

                entity.Property(e => e.Status)
                    .HasMaxLength(50)
                    .HasColumnName("STATUS")
                    .HasDefaultValueSql("('pending')");

                entity.Property(e => e.TotalAmount)
                    .HasColumnType("decimal(18, 2)")
                    .HasColumnName("TOTAL_AMOUNT");

                entity.Property(e => e.UserId).HasColumnName("USER_ID");

                entity.HasOne(d => d.Combo)
                    .WithMany(p => p.Bookings)
                    .HasForeignKey(d => d.ComboId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__BOOKINGS__COMBO___6E01572D");

                entity.HasOne(d => d.User)
                    .WithMany(p => p.Bookings)
                    .HasForeignKey(d => d.UserId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__BOOKINGS__USER_I__6D0D32F4");
            });

            modelBuilder.Entity<BookingCoupon>(entity =>
            {
                entity.ToTable("BOOKING_COUPONS");

                entity.HasIndex(e => new { e.BookingId, e.CouponId }, "UQ_BookingPromotion")
                    .IsUnique();

                entity.Property(e => e.Id).HasColumnName("ID");

                entity.Property(e => e.AppliedAt)
                    .HasColumnType("datetime")
                    .HasColumnName("APPLIED_AT")
                    .HasDefaultValueSql("(getdate())");

                entity.Property(e => e.BookingId).HasColumnName("BOOKING_ID");

                entity.Property(e => e.CouponId).HasColumnName("COUPON_ID");

                entity.HasOne(d => d.Booking)
                    .WithMany(p => p.BookingCoupons)
                    .HasForeignKey(d => d.BookingId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__BOOKING_C__BOOKI__72C60C4A");

                entity.HasOne(d => d.Coupon)
                    .WithMany(p => p.BookingCoupons)
                    .HasForeignKey(d => d.CouponId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__BOOKING_C__COUPO__73BA3083");
            });

            modelBuilder.Entity<Comment>(entity =>
            {
                entity.ToTable("COMMENTS");

                entity.Property(e => e.Id).HasColumnName("ID");

                entity.Property(e => e.AuthorId).HasColumnName("AUTHOR_ID");

                entity.Property(e => e.Content).HasColumnName("CONTENT");

                entity.Property(e => e.CreatedAt)
                    .HasColumnType("datetime")
                    .HasColumnName("CREATED_AT")
                    .HasDefaultValueSql("(getdate())");

                entity.Property(e => e.Image).HasMaxLength(500);

                entity.Property(e => e.ParentCommentId).HasColumnName("PARENT_COMMENT_ID");

                entity.Property(e => e.PostId).HasColumnName("POST_ID");

                entity.HasOne(d => d.Author)
                    .WithMany(p => p.Comments)
                    .HasForeignKey(d => d.AuthorId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__COMMENTS__AUTHOR__0C85DE4D");

                entity.HasOne(d => d.ParentComment)
                    .WithMany(p => p.InverseParentComment)
                    .HasForeignKey(d => d.ParentCommentId)
                    .HasConstraintName("FK__COMMENTS__PARENT__0D7A0286");

                entity.HasOne(d => d.Post)
                    .WithMany(p => p.Comments)
                    .HasForeignKey(d => d.PostId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__COMMENTS__POST_I__0B91BA14");
            });

            modelBuilder.Entity<Coupon>(entity =>
            {
                entity.ToTable("COUPONS");

                entity.HasIndex(e => e.Code, "UQ__COUPONS__AA1D4379DAE87058")
                    .IsUnique();

                entity.Property(e => e.Id).HasColumnName("ID");

                entity.Property(e => e.Code)
                    .HasMaxLength(50)
                    .HasColumnName("CODE");

                entity.Property(e => e.CreatedAt)
                    .HasColumnType("datetime")
                    .HasColumnName("CREATED_AT")
                    .HasDefaultValueSql("(getdate())");

                entity.Property(e => e.Description)
                    .HasMaxLength(255)
                    .HasColumnName("DESCRIPTION");

                entity.Property(e => e.DiscountAmount)
                    .HasColumnType("decimal(18, 2)")
                    .HasColumnName("DISCOUNT_AMOUNT");

                entity.Property(e => e.DiscountPercent)
                    .HasColumnType("decimal(5, 2)")
                    .HasColumnName("DISCOUNT_PERCENT");

                entity.Property(e => e.HostId).HasColumnName("HOST_ID");

                entity.Property(e => e.IsActive)
                    .HasColumnName("IS_ACTIVE")
                    .HasDefaultValueSql("((1))");

                entity.Property(e => e.ServicecomboId).HasColumnName("SERVICECOMBO_ID");

                entity.Property(e => e.UpdatedAt)
                    .HasColumnType("datetime")
                    .HasColumnName("UPDATED_AT")
                    .HasDefaultValueSql("(getdate())");

                entity.Property(e => e.UsageCount)
                    .HasColumnName("USAGE_COUNT")
                    .HasDefaultValueSql("((0))");

                entity.Property(e => e.UsageLimit).HasColumnName("USAGE_LIMIT");

                entity.HasOne(d => d.Host)
                    .WithMany(p => p.Coupons)
                    .HasForeignKey(d => d.HostId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__COUPONS__HOST_ID__66603565");

                entity.HasOne(d => d.Servicecombo)
                    .WithMany(p => p.Coupons)
                    .HasForeignKey(d => d.ServicecomboId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__COUPONS__SERVICE__6754599E");
            });

            modelBuilder.Entity<HostCertificate>(entity =>
            {
                entity.HasKey(e => e.CertificateId)
                    .HasName("PK__HOST_CER__BBF8A7C16A0E9C16");

                entity.ToTable("HOST_CERTIFICATES");

                entity.Property(e => e.BusinessLicenseFile).HasMaxLength(500);

                entity.Property(e => e.BusinessName).HasMaxLength(255);

                entity.Property(e => e.CreatedAt)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getdate())");

                entity.Property(e => e.Email).HasMaxLength(100);

                entity.Property(e => e.Phone).HasMaxLength(20);

                entity.Property(e => e.RejectComment).HasMaxLength(1000);

                entity.Property(e => e.ReviewComments).HasMaxLength(1000);

                entity.Property(e => e.Status)
                    .HasMaxLength(50)
                    .HasDefaultValueSql("('pending')");

                entity.Property(e => e.UpdatedAt)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getdate())");

                entity.HasOne(d => d.Host)
                    .WithMany(p => p.HostCertificates)
                    .HasForeignKey(d => d.HostId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__HOST_CERT__HostI__49C3F6B7");
            });

            modelBuilder.Entity<Message>(entity =>
            {
                entity.ToTable("MESSAGES");

                entity.Property(e => e.Id).HasColumnName("ID");

                entity.Property(e => e.Content)
                    .HasMaxLength(2000)
                    .HasColumnName("CONTENT");

                entity.Property(e => e.CreatedAt)
                    .HasColumnType("datetime")
                    .HasColumnName("CREATED_AT")
                    .HasDefaultValueSql("(getdate())");

                entity.Property(e => e.IsRead)
                    .HasColumnName("IS_READ")
                    .HasDefaultValueSql("((0))");

                entity.Property(e => e.ReceiverId).HasColumnName("RECEIVER_ID");

                entity.Property(e => e.SenderId).HasColumnName("SENDER_ID");

                entity.HasOne(d => d.Receiver)
                    .WithMany(p => p.MessageReceivers)
                    .HasForeignKey(d => d.ReceiverId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__MESSAGES__RECEIV__17036CC0");

                entity.HasOne(d => d.Sender)
                    .WithMany(p => p.MessageSenders)
                    .HasForeignKey(d => d.SenderId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__MESSAGES__SENDER__160F4887");
            });

            modelBuilder.Entity<News>(entity =>
            {
                entity.ToTable("NEWS");

                entity.Property(e => e.CreatedDate)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getdate())");

                entity.Property(e => e.Image).HasMaxLength(500);

                entity.Property(e => e.NewsTitle).HasMaxLength(255);

                entity.Property(e => e.SocialMediaLink).HasMaxLength(500);

                entity.HasOne(d => d.Account)
                    .WithMany(p => p.News)
                    .HasForeignKey(d => d.AccountId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__NEWS__AccountId__2645B050");
            });

            modelBuilder.Entity<Notification>(entity =>
            {
                entity.ToTable("NOTIFICATIONS");

                entity.Property(e => e.Id).HasColumnName("ID");

                entity.Property(e => e.CreatedAt)
                    .HasColumnType("datetime")
                    .HasColumnName("CREATED_AT")
                    .HasDefaultValueSql("(getdate())");

                entity.Property(e => e.IsRead)
                    .HasColumnName("IS_READ")
                    .HasDefaultValueSql("((0))");

                entity.Property(e => e.Message)
                    .HasMaxLength(500)
                    .HasColumnName("MESSAGE");

                entity.Property(e => e.Title).HasMaxLength(255);

                entity.Property(e => e.UserId).HasColumnName("USER_ID");

                entity.HasOne(d => d.User)
                    .WithMany(p => p.Notifications)
                    .HasForeignKey(d => d.UserId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__NOTIFICAT__USER___02FC7413");
            });

            modelBuilder.Entity<Otp>(entity =>
            {
                entity.ToTable("OTP");

                entity.Property(e => e.Id).HasColumnName("ID");

                entity.Property(e => e.Code)
                    .HasMaxLength(10)
                    .HasColumnName("CODE");

                entity.Property(e => e.CreatedAt)
                    .HasColumnType("datetime")
                    .HasColumnName("CREATED_AT")
                    .HasDefaultValueSql("(getdate())");

                entity.Property(e => e.Email)
                    .HasMaxLength(50)
                    .HasColumnName("EMAIL");

                entity.Property(e => e.ExpirationTime)
                    .HasColumnType("datetime")
                    .HasColumnName("EXPIRATION_TIME");

                entity.Property(e => e.IsVerified)
                    .HasColumnName("IS_VERIFIED")
                    .HasDefaultValueSql("((0))");

                entity.Property(e => e.UserId).HasColumnName("USER_ID");

                entity.HasOne(d => d.User)
                    .WithMany(p => p.Otps)
                    .HasForeignKey(d => d.UserId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__OTP__USER_ID__440B1D61");
            });

            modelBuilder.Entity<Payment>(entity =>
            {
                entity.ToTable("PAYMENTS");

                entity.Property(e => e.Id).HasColumnName("ID");

                entity.Property(e => e.Amount)
                    .HasColumnType("decimal(18, 2)")
                    .HasColumnName("AMOUNT");

                entity.Property(e => e.BookingId).HasColumnName("BOOKING_ID");

                entity.Property(e => e.Method)
                    .HasMaxLength(50)
                    .HasColumnName("METHOD");

                entity.Property(e => e.PaymentDate)
                    .HasColumnType("datetime")
                    .HasColumnName("PAYMENT_DATE")
                    .HasDefaultValueSql("(getdate())");

                entity.Property(e => e.Status)
                    .HasMaxLength(50)
                    .HasColumnName("STATUS")
                    .HasDefaultValueSql("('pending')");

                entity.HasOne(d => d.Booking)
                    .WithMany(p => p.Payments)
                    .HasForeignKey(d => d.BookingId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__PAYMENTS__BOOKIN__787EE5A0");
            });

            modelBuilder.Entity<Post>(entity =>
            {
                entity.ToTable("POSTS");

                entity.Property(e => e.Id).HasColumnName("ID");

                entity.Property(e => e.AuthorId).HasColumnName("AUTHOR_ID");

                entity.Property(e => e.Content).HasColumnName("CONTENT");

                entity.Property(e => e.CreatedAt)
                    .HasColumnType("datetime")
                    .HasColumnName("CREATED_AT")
                    .HasDefaultValueSql("(getdate())");

                entity.Property(e => e.Image).HasMaxLength(500);

                entity.Property(e => e.Title)
                    .HasMaxLength(255)
                    .HasColumnName("TITLE");

                entity.Property(e => e.UpdatedAt)
                    .HasColumnType("datetime")
                    .HasColumnName("UPDATED_AT")
                    .HasDefaultValueSql("(getdate())");

                entity.HasOne(d => d.Author)
                    .WithMany(p => p.Posts)
                    .HasForeignKey(d => d.AuthorId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__POSTS__AUTHOR_ID__07C12930");
            });

            modelBuilder.Entity<Reaction>(entity =>
            {
                entity.ToTable("REACTIONS");

                entity.Property(e => e.Id).HasColumnName("ID");

                entity.Property(e => e.CreatedAt)
                    .HasColumnType("datetime")
                    .HasColumnName("CREATED_AT")
                    .HasDefaultValueSql("(getdate())");

                entity.Property(e => e.ReactionType)
                    .HasMaxLength(20)
                    .HasColumnName("REACTION_TYPE");

                entity.Property(e => e.TargetId).HasColumnName("TARGET_ID");

                entity.Property(e => e.TargetType)
                    .HasMaxLength(20)
                    .HasColumnName("TARGET_TYPE");

                entity.Property(e => e.UserId).HasColumnName("USER_ID");

                entity.HasOne(d => d.User)
                    .WithMany(p => p.Reactions)
                    .HasForeignKey(d => d.UserId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__REACTIONS__USER___114A936A");
            });

            modelBuilder.Entity<RequestSupport>(entity =>
            {
                entity.ToTable("REQUEST_SUPPORTS");

                entity.Property(e => e.Id).HasColumnName("ID");

                entity.Property(e => e.ComboId).HasColumnName("COMBO_ID");

                entity.Property(e => e.Content)
                    .HasMaxLength(1000)
                    .HasColumnName("CONTENT");

                entity.Property(e => e.CreatedAt)
                    .HasColumnType("datetime")
                    .HasColumnName("CREATED_AT")
                    .HasDefaultValueSql("(getdate())");

                entity.Property(e => e.Image)
                    .HasMaxLength(255)
                    .IsUnicode(false)
                    .HasColumnName("IMAGE");

                entity.Property(e => e.Status)
                    .HasMaxLength(50)
                    .HasColumnName("STATUS")
                    .HasDefaultValueSql("('Pending')");

                entity.Property(e => e.SupportType)
                    .HasMaxLength(255)
                    .HasColumnName("SUPPORT_TYPE");

                entity.Property(e => e.UpdatedAt)
                    .HasColumnType("datetime")
                    .HasColumnName("UPDATED_AT")
                    .HasDefaultValueSql("(getdate())");

                entity.Property(e => e.UserId).HasColumnName("USER_ID");

                entity.HasOne(d => d.Combo)
                    .WithMany(p => p.RequestSupports)
                    .HasForeignKey(d => d.ComboId)
                    .HasConstraintName("FK__REQUEST_S__COMBO__1DB06A4F");

                entity.HasOne(d => d.User)
                    .WithMany(p => p.RequestSupports)
                    .HasForeignKey(d => d.UserId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__REQUEST_S__USER___1CBC4616");
            });

            modelBuilder.Entity<Review>(entity =>
            {
                entity.ToTable("REVIEWS");

                entity.Property(e => e.Id).HasColumnName("ID");

                entity.Property(e => e.AuthorId).HasColumnName("AUTHOR_ID");

                entity.Property(e => e.ComboId).HasColumnName("COMBO_ID");

                entity.Property(e => e.Content).HasColumnName("CONTENT");

                entity.Property(e => e.CreatedAt)
                    .HasColumnType("datetime")
                    .HasColumnName("CREATED_AT")
                    .HasDefaultValueSql("(getdate())");

                entity.Property(e => e.ParentReviewId).HasColumnName("PARENT_REVIEW_ID");

                entity.Property(e => e.Rating).HasColumnName("RATING");

                entity.HasOne(d => d.Author)
                    .WithMany(p => p.Reviews)
                    .HasForeignKey(d => d.AuthorId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__REVIEWS__AUTHOR___7D439ABD");

                entity.HasOne(d => d.Combo)
                    .WithMany(p => p.Reviews)
                    .HasForeignKey(d => d.ComboId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__REVIEWS__COMBO_I__7C4F7684");

                entity.HasOne(d => d.ParentReview)
                    .WithMany(p => p.InverseParentReview)
                    .HasForeignKey(d => d.ParentReviewId)
                    .HasConstraintName("FK__REVIEWS__PARENT___7E37BEF6");
            });

            modelBuilder.Entity<Role>(entity =>
            {
                entity.ToTable("ROLES");

                entity.HasIndex(e => e.Name, "UQ__ROLES__D9C1FA008ED1E6F8")
                    .IsUnique();

                entity.Property(e => e.Id).HasColumnName("ID");

                entity.Property(e => e.Description)
                    .HasMaxLength(255)
                    .HasColumnName("DESCRIPTION");

                entity.Property(e => e.Name)
                    .HasMaxLength(50)
                    .HasColumnName("NAME");
            });

            modelBuilder.Entity<Service>(entity =>
            {
                entity.ToTable("SERVICE");

                entity.Property(e => e.Id).HasColumnName("ID");

                entity.Property(e => e.CreatedAt)
                    .HasColumnType("datetime")
                    .HasColumnName("CREATED_AT")
                    .HasDefaultValueSql("(getdate())");

                entity.Property(e => e.Description)
                    .HasMaxLength(255)
                    .HasColumnName("DESCRIPTION");

                entity.Property(e => e.HostId).HasColumnName("HOST_ID");

                entity.Property(e => e.Name)
                    .HasMaxLength(255)
                    .HasColumnName("NAME");

                entity.Property(e => e.Price)
                    .HasColumnType("decimal(18, 2)")
                    .HasColumnName("PRICE");

                entity.Property(e => e.UpdatedAt)
                    .HasColumnType("datetime")
                    .HasColumnName("UPDATED_AT")
                    .HasDefaultValueSql("(getdate())");

                entity.HasOne(d => d.Host)
                    .WithMany(p => p.Services)
                    .HasForeignKey(d => d.HostId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__SERVICE__HOST_ID__5441852A");
            });

            modelBuilder.Entity<Servicecombo>(entity =>
            {
                entity.ToTable("SERVICECOMBO");

                entity.Property(e => e.Id).HasColumnName("ID");

                entity.Property(e => e.Address)
                    .HasMaxLength(255)
                    .HasColumnName("ADDRESS");

                entity.Property(e => e.AvailableSlots).HasColumnName("AVAILABLE_SLOTS");

                entity.Property(e => e.CancellationPolicy)
                    .HasMaxLength(1000)
                    .HasColumnName("CANCELLATION_POLICY");

                entity.Property(e => e.CreatedAt)
                    .HasColumnType("datetime")
                    .HasColumnName("CREATED_AT")
                    .HasDefaultValueSql("(getdate())");

                entity.Property(e => e.Description)
                    .HasMaxLength(1000)
                    .HasColumnName("DESCRIPTION");

                entity.Property(e => e.HostId).HasColumnName("HOST_ID");

                entity.Property(e => e.Image)
                    .HasMaxLength(255)
                    .HasColumnName("IMAGE");

                entity.Property(e => e.Name)
                    .HasMaxLength(255)
                    .HasColumnName("NAME");

                entity.Property(e => e.Price)
                    .HasColumnType("decimal(18, 2)")
                    .HasColumnName("PRICE");

                entity.Property(e => e.Status)
                    .HasMaxLength(50)
                    .HasColumnName("STATUS")
                    .HasDefaultValueSql("('open')");

                entity.Property(e => e.UpdatedAt)
                    .HasColumnType("datetime")
                    .HasColumnName("UPDATED_AT")
                    .HasDefaultValueSql("(getdate())");

                entity.HasOne(d => d.Host)
                    .WithMany(p => p.Servicecombos)
                    .HasForeignKey(d => d.HostId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__SERVICECO__HOST___59FA5E80");
            });

            modelBuilder.Entity<ServicecomboDetail>(entity =>
            {
                entity.ToTable("SERVICECOMBO_DETAIL");

                entity.Property(e => e.Id).HasColumnName("ID");

                entity.Property(e => e.Quantity)
                    .HasColumnName("QUANTITY")
                    .HasDefaultValueSql("((1))");

                entity.Property(e => e.ServiceId).HasColumnName("SERVICE_ID");

                entity.Property(e => e.ServicecomboId).HasColumnName("SERVICECOMBO_ID");

                entity.HasOne(d => d.Service)
                    .WithMany(p => p.ServicecomboDetails)
                    .HasForeignKey(d => d.ServiceId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__SERVICECO__SERVI__5EBF139D");

                entity.HasOne(d => d.Servicecombo)
                    .WithMany(p => p.ServicecomboDetails)
                    .HasForeignKey(d => d.ServicecomboId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__SERVICECO__SERVI__5DCAEF64");
            });

            modelBuilder.Entity<SupportResponse>(entity =>
            {
                entity.ToTable("SUPPORT_RESPONSES");

                entity.Property(e => e.Id).HasColumnName("ID");

                entity.Property(e => e.Content)
                    .HasMaxLength(1000)
                    .HasColumnName("CONTENT");

                entity.Property(e => e.CreatedAt)
                    .HasColumnType("datetime")
                    .HasColumnName("CREATED_AT")
                    .HasDefaultValueSql("(getdate())");

                entity.Property(e => e.Image)
                    .HasMaxLength(255)
                    .HasColumnName("IMAGE");

                entity.Property(e => e.ResponderId).HasColumnName("RESPONDER_ID");

                entity.Property(e => e.SupportId).HasColumnName("SUPPORT_ID");

                entity.HasOne(d => d.Responder)
                    .WithMany(p => p.SupportResponses)
                    .HasForeignKey(d => d.ResponderId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__SUPPORT_R__RESPO__22751F6C");

                entity.HasOne(d => d.Support)
                    .WithMany(p => p.SupportResponses)
                    .HasForeignKey(d => d.SupportId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__SUPPORT_R__SUPPO__2180FB33");
            });

            modelBuilder.Entity<SystemLog>(entity =>
            {
                entity.HasKey(e => e.LogId)
                    .HasName("PK__SYSTEM_L__5E5486488ADB87BA");

                entity.ToTable("SYSTEM_LOGS");

                entity.Property(e => e.CreatedAt)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getdate())");

                entity.Property(e => e.LogLevel).HasMaxLength(50);

                entity.Property(e => e.Module).HasMaxLength(100);
            });

            OnModelCreatingPartial(modelBuilder);
        }

        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
    }
}
