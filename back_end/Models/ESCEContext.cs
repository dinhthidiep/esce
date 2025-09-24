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
        public virtual DbSet<Booking> Bookings { get; set; } = null!;
        public virtual DbSet<BookingPromotion> BookingPromotions { get; set; } = null!;
        public virtual DbSet<Comment> Comments { get; set; } = null!;
        public virtual DbSet<Complaint> Complaints { get; set; } = null!;
        public virtual DbSet<ComplaintAction> ComplaintActions { get; set; } = null!;
        public virtual DbSet<GroupBooking> GroupBookings { get; set; } = null!;
        public virtual DbSet<GroupMember> GroupMembers { get; set; } = null!;
        public virtual DbSet<Message> Messages { get; set; } = null!;
        public virtual DbSet<Notification> Notifications { get; set; } = null!;
        public virtual DbSet<Otp> Otps { get; set; } = null!;
        public virtual DbSet<Payment> Payments { get; set; } = null!;
        public virtual DbSet<Post> Posts { get; set; } = null!;
        public virtual DbSet<Promotion> Promotions { get; set; } = null!;
        public virtual DbSet<Reaction> Reactions { get; set; } = null!;
        public virtual DbSet<RequestSupport> RequestSupports { get; set; } = null!;
        public virtual DbSet<Review> Reviews { get; set; } = null!;
        public virtual DbSet<Role> Roles { get; set; } = null!;
        public virtual DbSet<Tour> Tours { get; set; } = null!;
        public virtual DbSet<TourPromotion> TourPromotions { get; set; } = null!;

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see http://go.microsoft.com/fwlink/?LinkId=723263.
                optionsBuilder.UseSqlServer("Server=DESKTOP-TBDCMBV\\DINHHOANG;Database=ESCE;User Id=sa;Password=12345;");
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Account>(entity =>
            {
                entity.ToTable("ACCOUNTS");

                entity.HasIndex(e => e.Email, "UQ__ACCOUNTS__161CF7241A1F9215")
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
                    .HasColumnName("IS_ACTIVE")
                    .HasDefaultValueSql("((1))");

                entity.Property(e => e.Name)
                    .HasMaxLength(100)
                    .HasColumnName("NAME");


                entity.Property(e => e.PasswordHash)
                    .HasMaxLength(255)
                    .IsUnicode(false)
                    .HasColumnName("PASSWORD_HASH");

                entity.Property(e => e.PasswordSalt)
                    .HasMaxLength(255)
                    .IsUnicode(false)
                    .HasColumnName("PASSWORD_SALT");

                entity.Property(e => e.Phone)
                    .HasMaxLength(20)
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
                    .HasConstraintName("FK__ACCOUNTS__ROLE_I__2B3F6F97");
            });

            modelBuilder.Entity<Booking>(entity =>
            {
                entity.ToTable("BOOKINGS");

                entity.Property(e => e.Id).HasColumnName("ID");

                entity.Property(e => e.BookingDate)
                    .HasColumnType("datetime")
                    .HasColumnName("BOOKING_DATE")
                    .HasDefaultValueSql("(getdate())");

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

                entity.Property(e => e.TourId).HasColumnName("TOUR_ID");

                entity.Property(e => e.UserId).HasColumnName("USER_ID");

                entity.HasOne(d => d.Tour)
                    .WithMany(p => p.Bookings)
                    .HasForeignKey(d => d.TourId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__BOOKINGS__TOUR_I__44FF419A");

                entity.HasOne(d => d.User)
                    .WithMany(p => p.Bookings)
                    .HasForeignKey(d => d.UserId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__BOOKINGS__USER_I__440B1D61");
            });

            modelBuilder.Entity<BookingPromotion>(entity =>
            {
                entity.ToTable("BOOKING_PROMOTIONS");

                entity.HasIndex(e => new { e.BookingId, e.PromotionId }, "UQ_BookingPromotion")
                    .IsUnique();

                entity.Property(e => e.Id).HasColumnName("ID");

                entity.Property(e => e.AppliedAt)
                    .HasColumnType("datetime")
                    .HasColumnName("APPLIED_AT")
                    .HasDefaultValueSql("(getdate())");

                entity.Property(e => e.BookingId).HasColumnName("BOOKING_ID");

                entity.Property(e => e.PromotionId).HasColumnName("PROMOTION_ID");

                entity.HasOne(d => d.Booking)
                    .WithMany(p => p.BookingPromotions)
                    .HasForeignKey(d => d.BookingId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__BOOKING_P__BOOKI__49C3F6B7");

                entity.HasOne(d => d.Promotion)
                    .WithMany(p => p.BookingPromotions)
                    .HasForeignKey(d => d.PromotionId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__BOOKING_P__PROMO__4AB81AF0");
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

                entity.Property(e => e.ParentCommentId).HasColumnName("PARENT_COMMENT_ID");

                entity.Property(e => e.PostId).HasColumnName("POST_ID");

                entity.HasOne(d => d.Author)
                    .WithMany(p => p.Comments)
                    .HasForeignKey(d => d.AuthorId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__COMMENTS__AUTHOR__72C60C4A");

                entity.HasOne(d => d.ParentComment)
                    .WithMany(p => p.InverseParentComment)
                    .HasForeignKey(d => d.ParentCommentId)
                    .HasConstraintName("FK__COMMENTS__PARENT__73BA3083");

                entity.HasOne(d => d.Post)
                    .WithMany(p => p.Comments)
                    .HasForeignKey(d => d.PostId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__COMMENTS__POST_I__71D1E811");
            });

            modelBuilder.Entity<Complaint>(entity =>
            {
                entity.ToTable("COMPLAINTS");

                entity.Property(e => e.Id).HasColumnName("ID");

                entity.Property(e => e.BookingId).HasColumnName("BOOKING_ID");

                entity.Property(e => e.Content)
                    .HasMaxLength(1000)
                    .HasColumnName("CONTENT");

                entity.Property(e => e.CreatedAt)
                    .HasColumnType("datetime")
                    .HasColumnName("CREATED_AT")
                    .HasDefaultValueSql("(getdate())");

                entity.Property(e => e.Status)
                    .HasMaxLength(50)
                    .HasColumnName("STATUS")
                    .HasDefaultValueSql("('Pending')");

                entity.Property(e => e.Title)
                    .HasMaxLength(255)
                    .HasColumnName("TITLE");

                entity.Property(e => e.TourId).HasColumnName("TOUR_ID");

                entity.Property(e => e.UpdatedAt)
                    .HasColumnType("datetime")
                    .HasColumnName("UPDATED_AT")
                    .HasDefaultValueSql("(getdate())");

                entity.Property(e => e.UserId).HasColumnName("USER_ID");

                entity.HasOne(d => d.Booking)
                    .WithMany(p => p.Complaints)
                    .HasForeignKey(d => d.BookingId)
                    .HasConstraintName("FK__COMPLAINT__BOOKI__04E4BC85");

                entity.HasOne(d => d.Tour)
                    .WithMany(p => p.Complaints)
                    .HasForeignKey(d => d.TourId)
                    .HasConstraintName("FK__COMPLAINT__TOUR___03F0984C");

                entity.HasOne(d => d.User)
                    .WithMany(p => p.Complaints)
                    .HasForeignKey(d => d.UserId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__COMPLAINT__USER___02FC7413");
            });

            modelBuilder.Entity<ComplaintAction>(entity =>
            {
                entity.ToTable("COMPLAINT_ACTIONS");

                entity.Property(e => e.Id).HasColumnName("ID");

                entity.Property(e => e.ActionDate)
                    .HasColumnType("datetime")
                    .HasColumnName("ACTION_DATE")
                    .HasDefaultValueSql("(getdate())");

                entity.Property(e => e.ActionNote)
                    .HasMaxLength(1000)
                    .HasColumnName("ACTION_NOTE");

                entity.Property(e => e.ComplaintId).HasColumnName("COMPLAINT_ID");

                entity.Property(e => e.HandlerId).HasColumnName("HANDLER_ID");

                entity.Property(e => e.StatusAfter)
                    .HasMaxLength(50)
                    .HasColumnName("STATUS_AFTER");

                entity.HasOne(d => d.Complaint)
                    .WithMany(p => p.ComplaintActions)
                    .HasForeignKey(d => d.ComplaintId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__COMPLAINT__COMPL__08B54D69");

                entity.HasOne(d => d.Handler)
                    .WithMany(p => p.ComplaintActions)
                    .HasForeignKey(d => d.HandlerId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__COMPLAINT__HANDL__09A971A2");
            });

            modelBuilder.Entity<GroupBooking>(entity =>
            {
                entity.ToTable("GROUP_BOOKINGS");

                entity.HasIndex(e => e.InviteCode, "UQ__GROUP_BO__4FFB5D1FBE2CA5BC")
                    .IsUnique();

                entity.Property(e => e.Id).HasColumnName("ID");

                entity.Property(e => e.CreatedAt)
                    .HasColumnType("datetime")
                    .HasColumnName("CREATED_AT")
                    .HasDefaultValueSql("(getdate())");

                entity.Property(e => e.InviteCode)
                    .HasMaxLength(50)
                    .HasColumnName("INVITE_CODE");

                entity.Property(e => e.LeaderId).HasColumnName("LEADER_ID");

                entity.Property(e => e.Status)
                    .HasMaxLength(50)
                    .HasColumnName("STATUS")
                    .HasDefaultValueSql("('pending')");

                entity.Property(e => e.TourId).HasColumnName("TOUR_ID");

                entity.Property(e => e.UpdatedAt)
                    .HasColumnType("datetime")
                    .HasColumnName("UPDATED_AT")
                    .HasDefaultValueSql("(getdate())");

                entity.HasOne(d => d.Leader)
                    .WithMany(p => p.GroupBookings)
                    .HasForeignKey(d => d.LeaderId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__GROUP_BOO__LEADE__52593CB8");

                entity.HasOne(d => d.Tour)
                    .WithMany(p => p.GroupBookings)
                    .HasForeignKey(d => d.TourId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__GROUP_BOO__TOUR___5165187F");
            });

            modelBuilder.Entity<GroupMember>(entity =>
            {
                entity.ToTable("GROUP_MEMBERS");

                entity.HasIndex(e => new { e.GroupId, e.UserId }, "UQ_GroupMember")
                    .IsUnique();

                entity.Property(e => e.Id).HasColumnName("ID");

                entity.Property(e => e.GroupId).HasColumnName("GROUP_ID");

                entity.Property(e => e.JoinedAt)
                    .HasColumnType("datetime")
                    .HasColumnName("JOINED_AT")
                    .HasDefaultValueSql("(getdate())");

                entity.Property(e => e.Role)
                    .HasMaxLength(20)
                    .HasColumnName("ROLE")
                    .HasDefaultValueSql("('member')");

                entity.Property(e => e.Status)
                    .HasMaxLength(50)
                    .HasColumnName("STATUS")
                    .HasDefaultValueSql("('joined')");

                entity.Property(e => e.UserId).HasColumnName("USER_ID");

                entity.HasOne(d => d.Group)
                    .WithMany(p => p.GroupMembers)
                    .HasForeignKey(d => d.GroupId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__GROUP_MEM__GROUP__59063A47");

                entity.HasOne(d => d.User)
                    .WithMany(p => p.GroupMembers)
                    .HasForeignKey(d => d.UserId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__GROUP_MEM__USER___59FA5E80");
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
                    .HasConstraintName("FK__MESSAGES__RECEIV__7D439ABD");

                entity.HasOne(d => d.Sender)
                    .WithMany(p => p.MessageSenders)
                    .HasForeignKey(d => d.SenderId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__MESSAGES__SENDER__7C4F7684");
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

                entity.Property(e => e.UserId).HasColumnName("USER_ID");

                entity.HasOne(d => d.User)
                    .WithMany(p => p.Notifications)
                    .HasForeignKey(d => d.UserId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__NOTIFICAT__USER___693CA210");
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
                    .HasConstraintName("FK__OTP__USER_ID__300424B4");
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
                    .HasConstraintName("FK__PAYMENTS__BOOKIN__5EBF139D");
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
                    .HasConstraintName("FK__POSTS__AUTHOR_ID__6E01572D");
            });

            modelBuilder.Entity<Promotion>(entity =>
            {
                entity.ToTable("PROMOTIONS");

                entity.HasIndex(e => e.Code, "UQ__PROMOTIO__AA1D4379CE394951")
                    .IsUnique();

                entity.Property(e => e.Id).HasColumnName("ID");

                entity.Property(e => e.Code)
                    .HasMaxLength(50)
                    .HasColumnName("CODE");

                entity.Property(e => e.CreatedAt)
                    .HasColumnType("datetime")
                    .HasColumnName("CREATED_AT")
                    .HasDefaultValueSql("(getdate())");

                entity.Property(e => e.CreatedBy).HasColumnName("CREATED_BY");

                entity.Property(e => e.Description)
                    .HasMaxLength(255)
                    .HasColumnName("DESCRIPTION");

                entity.Property(e => e.DiscountAmount)
                    .HasColumnType("decimal(18, 2)")
                    .HasColumnName("DISCOUNT_AMOUNT");

                entity.Property(e => e.DiscountPercent)
                    .HasColumnType("decimal(5, 2)")
                    .HasColumnName("DISCOUNT_PERCENT");

                entity.Property(e => e.EndDate)
                    .HasColumnType("datetime")
                    .HasColumnName("END_DATE");

                entity.Property(e => e.IsActive)
                    .HasColumnName("IS_ACTIVE")
                    .HasDefaultValueSql("((1))");

                entity.Property(e => e.ScopeType)
                    .HasMaxLength(20)
                    .HasColumnName("SCOPE_TYPE");

                entity.Property(e => e.StartDate)
                    .HasColumnType("datetime")
                    .HasColumnName("START_DATE");

                entity.HasOne(d => d.CreatedByNavigation)
                    .WithMany(p => p.Promotions)
                    .HasForeignKey(d => d.CreatedBy)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__PROMOTION__CREAT__3B75D760");
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
                    .HasConstraintName("FK__REACTIONS__USER___778AC167");
            });

            modelBuilder.Entity<RequestSupport>(entity =>
            {
                entity.ToTable("REQUEST_SUPPORTS");

                entity.Property(e => e.Id).HasColumnName("ID");

                entity.Property(e => e.Content)
                    .HasMaxLength(1000)
                    .HasColumnName("CONTENT");

                entity.Property(e => e.CreatedAt)
                    .HasColumnType("datetime")
                    .HasColumnName("CREATED_AT")
                    .HasDefaultValueSql("(getdate())");

                entity.Property(e => e.Status)
                    .HasMaxLength(50)
                    .HasColumnName("STATUS")
                    .HasDefaultValueSql("('Pending')");

                entity.Property(e => e.SupportType)
                    .HasMaxLength(255)
                    .HasColumnName("SUPPORT_TYPE");

                entity.Property(e => e.TourId).HasColumnName("TOUR_ID");

                entity.Property(e => e.UpdatedAt)
                    .HasColumnType("datetime")
                    .HasColumnName("UPDATED_AT")
                    .HasDefaultValueSql("(getdate())");

                entity.Property(e => e.UserId).HasColumnName("USER_ID");

                entity.HasOne(d => d.Tour)
                    .WithMany(p => p.RequestSupports)
                    .HasForeignKey(d => d.TourId)
                    .HasConstraintName("FK__REQUEST_S__TOUR___10566F31");

                entity.HasOne(d => d.User)
                    .WithMany(p => p.RequestSupports)
                    .HasForeignKey(d => d.UserId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__REQUEST_S__USER___0F624AF8");
            });

            modelBuilder.Entity<Review>(entity =>
            {
                entity.ToTable("REVIEWS");

                entity.Property(e => e.Id).HasColumnName("ID");

                entity.Property(e => e.AuthorId).HasColumnName("AUTHOR_ID");

                entity.Property(e => e.Content).HasColumnName("CONTENT");

                entity.Property(e => e.CreatedAt)
                    .HasColumnType("datetime")
                    .HasColumnName("CREATED_AT")
                    .HasDefaultValueSql("(getdate())");

                entity.Property(e => e.ParentReviewId).HasColumnName("PARENT_REVIEW_ID");

                entity.Property(e => e.Rating).HasColumnName("RATING");

                entity.Property(e => e.TourId).HasColumnName("TOUR_ID");

                entity.HasOne(d => d.Author)
                    .WithMany(p => p.Reviews)
                    .HasForeignKey(d => d.AuthorId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__REVIEWS__AUTHOR___6383C8BA");

                entity.HasOne(d => d.ParentReview)
                    .WithMany(p => p.InverseParentReview)
                    .HasForeignKey(d => d.ParentReviewId)
                    .HasConstraintName("FK__REVIEWS__PARENT___6477ECF3");

                entity.HasOne(d => d.Tour)
                    .WithMany(p => p.Reviews)
                    .HasForeignKey(d => d.TourId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__REVIEWS__TOUR_ID__628FA481");
            });

            modelBuilder.Entity<Role>(entity =>
            {
                entity.ToTable("ROLES");

                entity.HasIndex(e => e.Name, "UQ__ROLES__D9C1FA00B3EE1717")
                    .IsUnique();

                entity.Property(e => e.Id).HasColumnName("ID");

                entity.Property(e => e.Description)
                    .HasMaxLength(255)
                    .HasColumnName("DESCRIPTION");

                entity.Property(e => e.Name)
                    .HasMaxLength(50)
                    .HasColumnName("NAME");
            });

            modelBuilder.Entity<Tour>(entity =>
            {
                entity.ToTable("TOURS");

                entity.Property(e => e.Id).HasColumnName("ID");

                entity.Property(e => e.Address)
                    .HasMaxLength(255)
                    .HasColumnName("ADDRESS");

                entity.Property(e => e.AvailableSlots).HasColumnName("AVAILABLE_SLOTS");

                entity.Property(e => e.Capacity).HasColumnName("CAPACITY");

                entity.Property(e => e.CreatedAt)
                    .HasColumnType("datetime")
                    .HasColumnName("CREATED_AT")
                    .HasDefaultValueSql("(getdate())");

                entity.Property(e => e.Description)
                    .HasMaxLength(1000)
                    .HasColumnName("DESCRIPTION");

                entity.Property(e => e.EndDate)
                    .HasColumnType("date")
                    .HasColumnName("END_DATE");

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

                entity.Property(e => e.StartDate)
                    .HasColumnType("date")
                    .HasColumnName("START_DATE");

                entity.Property(e => e.Status)
                    .HasMaxLength(50)
                    .HasColumnName("STATUS")
                    .HasDefaultValueSql("('open')");

                entity.Property(e => e.UpdatedAt)
                    .HasColumnType("datetime")
                    .HasColumnName("UPDATED_AT")
                    .HasDefaultValueSql("(getdate())");

                entity.HasOne(d => d.Host)
                    .WithMany(p => p.Tours)
                    .HasForeignKey(d => d.HostId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__TOURS__HOST_ID__35BCFE0A");
            });

            modelBuilder.Entity<TourPromotion>(entity =>
            {
                entity.ToTable("TOUR_PROMOTIONS");

                entity.Property(e => e.Id).HasColumnName("ID");

                entity.Property(e => e.PromotionId).HasColumnName("PROMOTION_ID");

                entity.Property(e => e.TourId).HasColumnName("TOUR_ID");

                entity.HasOne(d => d.Promotion)
                    .WithMany(p => p.TourPromotions)
                    .HasForeignKey(d => d.PromotionId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__TOUR_PROM__PROMO__3F466844");

                entity.HasOne(d => d.Tour)
                    .WithMany(p => p.TourPromotions)
                    .HasForeignKey(d => d.TourId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__TOUR_PROM__TOUR___3E52440B");
            });

            OnModelCreatingPartial(modelBuilder);
        }

        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
    }
}
