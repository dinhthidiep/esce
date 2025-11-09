using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ESCE_SYSTEM.Migrations
{
    public partial class FixHostRelation : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK__ACCOUNTS__ROLE_I__2B3F6F97",
                table: "ACCOUNTS");

            migrationBuilder.DropForeignKey(
                name: "FK__AGENCIE_C__Accou__3B75D760",
                table: "AGENCIE_CERTIFICATES");

            migrationBuilder.DropForeignKey(
                name: "FK__BOOKING_C__BOOKI__5EBF139D",
                table: "BOOKING_COUPONS");

            migrationBuilder.DropForeignKey(
                name: "FK__BOOKING_C__COUPO__5FB337D6",
                table: "BOOKING_COUPONS");

            migrationBuilder.DropForeignKey(
                name: "FK__BOOKINGS__COMBO___59FA5E80",
                table: "BOOKINGS");

            migrationBuilder.DropForeignKey(
                name: "FK__BOOKINGS__USER_I__59063A47",
                table: "BOOKINGS");

            migrationBuilder.DropForeignKey(
                name: "FK__COMMENTS__AUTHOR__787EE5A0",
                table: "COMMENTS");

            migrationBuilder.DropForeignKey(
                name: "FK__COMMENTS__POST_I__778AC167",
                table: "COMMENTS");

            migrationBuilder.DropForeignKey(
                name: "FK__COUPONS__HOST_ID__52593CB8",
                table: "COUPONS");

            migrationBuilder.DropForeignKey(
                name: "FK__COUPONS__SERVICE__534D60F1",
                table: "COUPONS");

            migrationBuilder.DropForeignKey(
                name: "FK__HOST_CERT__HostI__35BCFE0A",
                table: "HOST_CERTIFICATES");

            migrationBuilder.DropForeignKey(
                name: "FK__MESSAGES__SENDER__02084FDA",
                table: "MESSAGES");

            migrationBuilder.DropForeignKey(
                name: "FK__NEWS__AccountId__123EB7A3",
                table: "NEWS");

            migrationBuilder.DropForeignKey(
                name: "FK__NOTIFICAT__USER___6EF57B66",
                table: "NOTIFICATIONS");

            migrationBuilder.DropForeignKey(
                name: "FK__OTP__USER_ID__300424B4",
                table: "OTP");

            migrationBuilder.DropForeignKey(
                name: "FK__PAYMENTS__BOOKIN__6477ECF3",
                table: "PAYMENTS");

            migrationBuilder.DropForeignKey(
                name: "FK__POSTS__AUTHOR_ID__73BA3083",
                table: "POSTS");

            migrationBuilder.DropForeignKey(
                name: "FK__REVIEWS__AUTHOR___693CA210",
                table: "REVIEWS");

            migrationBuilder.DropForeignKey(
                name: "FK__REVIEWS__COMBO_I__68487DD7",
                table: "REVIEWS");

            migrationBuilder.DropForeignKey(
                name: "FK__SERVICE__HOST_ID__403A8C7D",
                table: "SERVICE");

            migrationBuilder.DropForeignKey(
                name: "FK__SERVICECO__HOST___45F365D3",
                table: "SERVICECOMBO");

            migrationBuilder.DropForeignKey(
                name: "FK__SERVICECO__SERVI__49C3F6B7",
                table: "SERVICECOMBO_DETAIL");

            migrationBuilder.DropForeignKey(
                name: "FK__SERVICECO__SERVI__4AB81AF0",
                table: "SERVICECOMBO_DETAIL");

            migrationBuilder.DropTable(
                name: "REACTIONS");

            migrationBuilder.DropTable(
                name: "SUPPORT_RESPONSES");

            migrationBuilder.DropTable(
                name: "REQUEST_SUPPORTS");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ROLES",
                table: "ROLES");

            migrationBuilder.DropPrimaryKey(
                name: "PK_REVIEWS",
                table: "REVIEWS");

            migrationBuilder.DropPrimaryKey(
                name: "PK_POSTS",
                table: "POSTS");

            migrationBuilder.DropIndex(
                name: "IX_POSTS_AUTHOR_ID",
                table: "POSTS");

            migrationBuilder.DropPrimaryKey(
                name: "PK_PAYMENTS",
                table: "PAYMENTS");

            migrationBuilder.DropPrimaryKey(
                name: "PK_NOTIFICATIONS",
                table: "NOTIFICATIONS");

            migrationBuilder.DropPrimaryKey(
                name: "PK_NEWS",
                table: "NEWS");

            migrationBuilder.DropPrimaryKey(
                name: "PK_MESSAGES",
                table: "MESSAGES");

            migrationBuilder.DropPrimaryKey(
                name: "PK_COUPONS",
                table: "COUPONS");

            migrationBuilder.DropPrimaryKey(
                name: "PK_COMMENTS",
                table: "COMMENTS");

            migrationBuilder.DropPrimaryKey(
                name: "PK_BOOKINGS",
                table: "BOOKINGS");

            migrationBuilder.DropIndex(
                name: "IX_BOOKINGS_COMBO_ID",
                table: "BOOKINGS");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ACCOUNTS",
                table: "ACCOUNTS");

            migrationBuilder.DropPrimaryKey(
                name: "PK_SERVICECOMBO_DETAIL",
                table: "SERVICECOMBO_DETAIL");

            migrationBuilder.DropPrimaryKey(
                name: "PK_SERVICE",
                table: "SERVICE");

            migrationBuilder.DropPrimaryKey(
                name: "PK_OTP",
                table: "OTP");

            migrationBuilder.DropPrimaryKey(
                name: "PK__HOST_CER__BBF8A7C1722F012C",
                table: "HOST_CERTIFICATES");

            migrationBuilder.DropPrimaryKey(
                name: "PK__AGENCIE___95C546DB5FDFFD15",
                table: "AGENCIE_CERTIFICATES");

            migrationBuilder.DropColumn(
                name: "CONTENT",
                table: "REVIEWS");

            migrationBuilder.DropColumn(
                name: "CREATED_AT",
                table: "REVIEWS");

            migrationBuilder.DropColumn(
                name: "METHOD",
                table: "PAYMENTS");

            migrationBuilder.DropColumn(
                name: "IMAGE",
                table: "COMMENTS");

            migrationBuilder.DropColumn(
                name: "COMBO_ID",
                table: "BOOKINGS");

            migrationBuilder.DropColumn(
                name: "END_DATE",
                table: "BOOKINGS");

            migrationBuilder.DropColumn(
                name: "START_DATE",
                table: "BOOKINGS");

            migrationBuilder.DropColumn(
                name: "PASSWORD_SALT",
                table: "ACCOUNTS");

            migrationBuilder.DropColumn(
                name: "Image",
                table: "HOST_CERTIFICATES");

            migrationBuilder.DropColumn(
                name: "Image",
                table: "AGENCIE_CERTIFICATES");

            migrationBuilder.RenameTable(
                name: "ROLES",
                newName: "Roles");

            migrationBuilder.RenameTable(
                name: "REVIEWS",
                newName: "Reviews");

            migrationBuilder.RenameTable(
                name: "POSTS",
                newName: "Posts");

            migrationBuilder.RenameTable(
                name: "PAYMENTS",
                newName: "Payments");

            migrationBuilder.RenameTable(
                name: "NOTIFICATIONS",
                newName: "Notifications");

            migrationBuilder.RenameTable(
                name: "NEWS",
                newName: "News");

            migrationBuilder.RenameTable(
                name: "MESSAGES",
                newName: "Messages");

            migrationBuilder.RenameTable(
                name: "COUPONS",
                newName: "Coupons");

            migrationBuilder.RenameTable(
                name: "COMMENTS",
                newName: "Comments");

            migrationBuilder.RenameTable(
                name: "BOOKINGS",
                newName: "Bookings");

            migrationBuilder.RenameTable(
                name: "ACCOUNTS",
                newName: "Accounts");

            migrationBuilder.RenameTable(
                name: "SERVICECOMBO_DETAIL",
                newName: "ServiceComboDetails");

            migrationBuilder.RenameTable(
                name: "SERVICE",
                newName: "Services");

            migrationBuilder.RenameTable(
                name: "OTP",
                newName: "Otps");

            migrationBuilder.RenameTable(
                name: "HOST_CERTIFICATES",
                newName: "HostCertificates");

            migrationBuilder.RenameTable(
                name: "AGENCIE_CERTIFICATES",
                newName: "AgencieCertificates");

            migrationBuilder.RenameColumn(
                name: "STATUS",
                table: "SERVICECOMBO",
                newName: "Status");

            migrationBuilder.RenameColumn(
                name: "PRICE",
                table: "SERVICECOMBO",
                newName: "Price");

            migrationBuilder.RenameColumn(
                name: "NAME",
                table: "SERVICECOMBO",
                newName: "Name");

            migrationBuilder.RenameColumn(
                name: "IMAGE",
                table: "SERVICECOMBO",
                newName: "Image");

            migrationBuilder.RenameColumn(
                name: "DESCRIPTION",
                table: "SERVICECOMBO",
                newName: "Description");

            migrationBuilder.RenameColumn(
                name: "ADDRESS",
                table: "SERVICECOMBO",
                newName: "Address");

            migrationBuilder.RenameColumn(
                name: "ID",
                table: "SERVICECOMBO",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "NAME",
                table: "Roles",
                newName: "Name");

            migrationBuilder.RenameColumn(
                name: "DESCRIPTION",
                table: "Roles",
                newName: "Description");

            migrationBuilder.RenameColumn(
                name: "ID",
                table: "Roles",
                newName: "Id");

            migrationBuilder.RenameIndex(
                name: "UQ__ROLES__D9C1FA000635C206",
                table: "Roles",
                newName: "IX_Roles_Name");

            migrationBuilder.RenameColumn(
                name: "RATING",
                table: "Reviews",
                newName: "Rating");

            migrationBuilder.RenameColumn(
                name: "ID",
                table: "Reviews",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "PARENT_REVIEW_ID",
                table: "Reviews",
                newName: "AccountId");

            migrationBuilder.RenameColumn(
                name: "COMBO_ID",
                table: "Reviews",
                newName: "UserId");

            migrationBuilder.RenameColumn(
                name: "AUTHOR_ID",
                table: "Reviews",
                newName: "BookingId");

            migrationBuilder.RenameIndex(
                name: "IX_REVIEWS_COMBO_ID",
                table: "Reviews",
                newName: "IX_Reviews_UserId");

            migrationBuilder.RenameIndex(
                name: "IX_REVIEWS_AUTHOR_ID",
                table: "Reviews",
                newName: "IX_Reviews_BookingId");

            migrationBuilder.RenameColumn(
                name: "TITLE",
                table: "Posts",
                newName: "Title");

            migrationBuilder.RenameColumn(
                name: "IMAGE",
                table: "Posts",
                newName: "Image");

            migrationBuilder.RenameColumn(
                name: "CONTENT",
                table: "Posts",
                newName: "Content");

            migrationBuilder.RenameColumn(
                name: "ID",
                table: "Posts",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "UPDATED_AT",
                table: "Posts",
                newName: "UpdatedAt");

            migrationBuilder.RenameColumn(
                name: "CREATED_AT",
                table: "Posts",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "AUTHOR_ID",
                table: "Posts",
                newName: "AuthorId");

            migrationBuilder.RenameColumn(
                name: "STATUS",
                table: "Payments",
                newName: "Status");

            migrationBuilder.RenameColumn(
                name: "AMOUNT",
                table: "Payments",
                newName: "Amount");

            migrationBuilder.RenameColumn(
                name: "ID",
                table: "Payments",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "PAYMENT_DATE",
                table: "Payments",
                newName: "PaymentDate");

            migrationBuilder.RenameColumn(
                name: "BOOKING_ID",
                table: "Payments",
                newName: "BookingId");

            migrationBuilder.RenameIndex(
                name: "IX_PAYMENTS_BOOKING_ID",
                table: "Payments",
                newName: "IX_Payments_BookingId");

            migrationBuilder.RenameColumn(
                name: "MESSAGE",
                table: "Notifications",
                newName: "Message");

            migrationBuilder.RenameColumn(
                name: "ID",
                table: "Notifications",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "USER_ID",
                table: "Notifications",
                newName: "UserId");

            migrationBuilder.RenameColumn(
                name: "IS_READ",
                table: "Notifications",
                newName: "IsRead");

            migrationBuilder.RenameColumn(
                name: "CREATED_AT",
                table: "Notifications",
                newName: "CreatedAt");

            migrationBuilder.RenameIndex(
                name: "IX_NOTIFICATIONS_USER_ID",
                table: "Notifications",
                newName: "IX_Notifications_UserId");

            migrationBuilder.RenameIndex(
                name: "IX_NEWS_AccountId",
                table: "News",
                newName: "IX_News_AccountId");

            migrationBuilder.RenameColumn(
                name: "CONTENT",
                table: "Messages",
                newName: "Content");

            migrationBuilder.RenameColumn(
                name: "ID",
                table: "Messages",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "SENDER_ID",
                table: "Messages",
                newName: "SenderId");

            migrationBuilder.RenameColumn(
                name: "RECEIVER_ID",
                table: "Messages",
                newName: "ReceiverId");

            migrationBuilder.RenameColumn(
                name: "IS_READ",
                table: "Messages",
                newName: "IsRead");

            migrationBuilder.RenameColumn(
                name: "CREATED_AT",
                table: "Messages",
                newName: "CreatedAt");

            migrationBuilder.RenameIndex(
                name: "IX_MESSAGES_SENDER_ID",
                table: "Messages",
                newName: "IX_Messages_SenderId");

            migrationBuilder.RenameColumn(
                name: "DESCRIPTION",
                table: "Coupons",
                newName: "Description");

            migrationBuilder.RenameColumn(
                name: "CODE",
                table: "Coupons",
                newName: "Code");

            migrationBuilder.RenameColumn(
                name: "ID",
                table: "Coupons",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "USAGE_LIMIT",
                table: "Coupons",
                newName: "UsageLimit");

            migrationBuilder.RenameColumn(
                name: "USAGE_COUNT",
                table: "Coupons",
                newName: "UsageCount");

            migrationBuilder.RenameColumn(
                name: "UPDATED_AT",
                table: "Coupons",
                newName: "UpdatedAt");

            migrationBuilder.RenameColumn(
                name: "SERVICECOMBO_ID",
                table: "Coupons",
                newName: "ServiceComboId");

            migrationBuilder.RenameColumn(
                name: "IS_ACTIVE",
                table: "Coupons",
                newName: "IsActive");

            migrationBuilder.RenameColumn(
                name: "HOST_ID",
                table: "Coupons",
                newName: "HostId");

            migrationBuilder.RenameColumn(
                name: "DISCOUNT_PERCENT",
                table: "Coupons",
                newName: "DiscountPercent");

            migrationBuilder.RenameColumn(
                name: "DISCOUNT_AMOUNT",
                table: "Coupons",
                newName: "DiscountAmount");

            migrationBuilder.RenameColumn(
                name: "CREATED_AT",
                table: "Coupons",
                newName: "CreatedAt");

            migrationBuilder.RenameIndex(
                name: "UQ__COUPONS__AA1D4379B4900E43",
                table: "Coupons",
                newName: "IX_Coupons_Code");

            migrationBuilder.RenameIndex(
                name: "IX_COUPONS_SERVICECOMBO_ID",
                table: "Coupons",
                newName: "IX_Coupons_ServiceComboId");

            migrationBuilder.RenameIndex(
                name: "IX_COUPONS_HOST_ID",
                table: "Coupons",
                newName: "IX_Coupons_HostId");

            migrationBuilder.RenameColumn(
                name: "CONTENT",
                table: "Comments",
                newName: "Content");

            migrationBuilder.RenameColumn(
                name: "ID",
                table: "Comments",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "POST_ID",
                table: "Comments",
                newName: "PostId");

            migrationBuilder.RenameColumn(
                name: "PARENT_COMMENT_ID",
                table: "Comments",
                newName: "ParentCommentId");

            migrationBuilder.RenameColumn(
                name: "CREATED_AT",
                table: "Comments",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "AUTHOR_ID",
                table: "Comments",
                newName: "AuthorId");

            migrationBuilder.RenameIndex(
                name: "IX_COMMENTS_POST_ID",
                table: "Comments",
                newName: "IX_Comments_PostId");

            migrationBuilder.RenameIndex(
                name: "IX_COMMENTS_AUTHOR_ID",
                table: "Comments",
                newName: "IX_Comments_AuthorId");

            migrationBuilder.RenameColumn(
                name: "STATUS",
                table: "Bookings",
                newName: "Status");

            migrationBuilder.RenameColumn(
                name: "QUANTITY",
                table: "Bookings",
                newName: "Quantity");

            migrationBuilder.RenameColumn(
                name: "NOTES",
                table: "Bookings",
                newName: "Notes");

            migrationBuilder.RenameColumn(
                name: "ID",
                table: "Bookings",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "USER_ID",
                table: "Bookings",
                newName: "UserId");

            migrationBuilder.RenameColumn(
                name: "TOTAL_AMOUNT",
                table: "Bookings",
                newName: "TotalAmount");

            migrationBuilder.RenameColumn(
                name: "BOOKING_DATE",
                table: "Bookings",
                newName: "BookingDate");

            migrationBuilder.RenameIndex(
                name: "IX_BOOKINGS_USER_ID",
                table: "Bookings",
                newName: "IX_Bookings_UserId");

            migrationBuilder.RenameIndex(
                name: "UQ_BookingPromotion",
                table: "BOOKING_COUPONS",
                newName: "IX_BOOKING_COUPONS_BOOKING_ID_COUPON_ID");

            migrationBuilder.RenameColumn(
                name: "PHONE",
                table: "Accounts",
                newName: "Phone");

            migrationBuilder.RenameColumn(
                name: "NAME",
                table: "Accounts",
                newName: "Name");

            migrationBuilder.RenameColumn(
                name: "GENDER",
                table: "Accounts",
                newName: "Gender");

            migrationBuilder.RenameColumn(
                name: "EMAIL",
                table: "Accounts",
                newName: "Email");

            migrationBuilder.RenameColumn(
                name: "DOB",
                table: "Accounts",
                newName: "Dob");

            migrationBuilder.RenameColumn(
                name: "AVATAR",
                table: "Accounts",
                newName: "Avatar");

            migrationBuilder.RenameColumn(
                name: "ADDRESS",
                table: "Accounts",
                newName: "Address");

            migrationBuilder.RenameColumn(
                name: "ID",
                table: "Accounts",
                newName: "Id");

            migrationBuilder.RenameIndex(
                name: "IX_ACCOUNTS_ROLE_ID",
                table: "Accounts",
                newName: "IX_Accounts_ROLE_ID");

            migrationBuilder.RenameIndex(
                name: "UQ__ACCOUNTS__161CF724757E8893",
                table: "Accounts",
                newName: "IX_Accounts_Email");

            migrationBuilder.RenameColumn(
                name: "QUANTITY",
                table: "ServiceComboDetails",
                newName: "Quantity");

            migrationBuilder.RenameColumn(
                name: "ID",
                table: "ServiceComboDetails",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "SERVICE_ID",
                table: "ServiceComboDetails",
                newName: "ServiceId");

            migrationBuilder.RenameColumn(
                name: "SERVICECOMBO_ID",
                table: "ServiceComboDetails",
                newName: "ServiceComboId");

            migrationBuilder.RenameIndex(
                name: "IX_SERVICECOMBO_DETAIL_SERVICECOMBO_ID",
                table: "ServiceComboDetails",
                newName: "IX_ServiceComboDetails_ServiceComboId");

            migrationBuilder.RenameIndex(
                name: "IX_SERVICECOMBO_DETAIL_SERVICE_ID",
                table: "ServiceComboDetails",
                newName: "IX_ServiceComboDetails_ServiceId");

            migrationBuilder.RenameColumn(
                name: "UPDATED_AT",
                table: "Services",
                newName: "Updated_At");

            migrationBuilder.RenameColumn(
                name: "PRICE",
                table: "Services",
                newName: "Price");

            migrationBuilder.RenameColumn(
                name: "NAME",
                table: "Services",
                newName: "Name");

            migrationBuilder.RenameColumn(
                name: "DESCRIPTION",
                table: "Services",
                newName: "Description");

            migrationBuilder.RenameColumn(
                name: "CREATED_AT",
                table: "Services",
                newName: "Created_At");

            migrationBuilder.RenameColumn(
                name: "ID",
                table: "Services",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "HOST_ID",
                table: "Services",
                newName: "HostId");

            migrationBuilder.RenameIndex(
                name: "IX_SERVICE_HOST_ID",
                table: "Services",
                newName: "IX_Services_HostId");

            migrationBuilder.RenameColumn(
                name: "EMAIL",
                table: "Otps",
                newName: "Email");

            migrationBuilder.RenameColumn(
                name: "CODE",
                table: "Otps",
                newName: "Code");

            migrationBuilder.RenameColumn(
                name: "ID",
                table: "Otps",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "USER_ID",
                table: "Otps",
                newName: "UserId");

            migrationBuilder.RenameColumn(
                name: "IS_VERIFIED",
                table: "Otps",
                newName: "IsVerified");

            migrationBuilder.RenameColumn(
                name: "EXPIRATION_TIME",
                table: "Otps",
                newName: "ExpirationTime");

            migrationBuilder.RenameColumn(
                name: "CREATED_AT",
                table: "Otps",
                newName: "CreatedAt");

            migrationBuilder.RenameIndex(
                name: "IX_OTP_USER_ID",
                table: "Otps",
                newName: "IX_Otps_UserId");

            migrationBuilder.RenameIndex(
                name: "IX_HOST_CERTIFICATES_HostId",
                table: "HostCertificates",
                newName: "IX_HostCertificates_HostId");

            migrationBuilder.RenameColumn(
                name: "COMPANYNAME",
                table: "AgencieCertificates",
                newName: "Companyname");

            migrationBuilder.RenameIndex(
                name: "IX_AGENCIE_CERTIFICATES_AccountId",
                table: "AgencieCertificates",
                newName: "IX_AgencieCertificates_AccountId");

            migrationBuilder.AlterColumn<DateTime>(
                name: "UPDATED_AT",
                table: "SERVICECOMBO",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime",
                oldNullable: true,
                oldDefaultValueSql: "(getdate())");

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "SERVICECOMBO",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50,
                oldNullable: true,
                oldDefaultValueSql: "('open')");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CREATED_AT",
                table: "SERVICECOMBO",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime",
                oldNullable: true,
                oldDefaultValueSql: "(getdate())");

            migrationBuilder.AddColumn<int>(
                name: "HostId1",
                table: "SERVICECOMBO",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "Roles",
                type: "nvarchar(450)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "Roles",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "Rating",
                table: "Reviews",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Comment",
                table: "Reviews",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedDate",
                table: "Reviews",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "Reviews",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<string>(
                name: "Title",
                table: "Posts",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255);

            migrationBuilder.AlterColumn<string>(
                name: "Image",
                table: "Posts",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "Posts",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime",
                oldNullable: true,
                oldDefaultValueSql: "(getdate())");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "Posts",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime",
                oldNullable: true,
                oldDefaultValueSql: "(getdate())");

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "Payments",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50,
                oldNullable: true,
                oldDefaultValueSql: "('pending')");

            migrationBuilder.AlterColumn<DateTime>(
                name: "PaymentDate",
                table: "Payments",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime",
                oldNullable: true,
                oldDefaultValueSql: "(getdate())");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Payments",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "PaymentMethod",
                table: "Payments",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TransactionId",
                table: "Payments",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Payments",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Message",
                table: "Notifications",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "IsRead",
                table: "Notifications",
                type: "bit",
                nullable: true,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldNullable: true,
                oldDefaultValueSql: "((0))");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "Notifications",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime",
                oldNullable: true,
                oldDefaultValueSql: "(getdate())");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedDate",
                table: "News",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime",
                oldNullable: true,
                oldDefaultValueSql: "(getdate())");

            migrationBuilder.AlterColumn<string>(
                name: "Content",
                table: "Messages",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(2000)",
                oldMaxLength: 2000);

            migrationBuilder.AlterColumn<bool>(
                name: "IsRead",
                table: "Messages",
                type: "bit",
                nullable: true,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldNullable: true,
                oldDefaultValueSql: "((0))");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "Messages",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime",
                oldNullable: true,
                oldDefaultValueSql: "(getdate())");

            migrationBuilder.AlterColumn<int>(
                name: "UsageCount",
                table: "Coupons",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true,
                oldDefaultValueSql: "((0))");

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "Coupons",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime",
                oldNullable: true,
                oldDefaultValueSql: "(getdate())");

            migrationBuilder.AlterColumn<int>(
                name: "ServiceComboId",
                table: "Coupons",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<bool>(
                name: "IsActive",
                table: "Coupons",
                type: "bit",
                nullable: false,
                defaultValue: false,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldNullable: true,
                oldDefaultValueSql: "((1))");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "Coupons",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime",
                oldNullable: true,
                oldDefaultValueSql: "(getdate())");

            migrationBuilder.AddColumn<DateTime>(
                name: "ExpiryDate",
                table: "Coupons",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "Comments",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime",
                oldNullable: true,
                oldDefaultValueSql: "(getdate())");

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "Bookings",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50,
                oldNullable: true,
                oldDefaultValueSql: "('pending')");

            migrationBuilder.AlterColumn<string>(
                name: "Notes",
                table: "Bookings",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "BookingDate",
                table: "Bookings",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime",
                oldNullable: true,
                oldDefaultValueSql: "(getdate())");

            migrationBuilder.AddColumn<string>(
                name: "BookingNumber",
                table: "Bookings",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "CompletedDate",
                table: "Bookings",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ConfirmedDate",
                table: "Bookings",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Bookings",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "ItemType",
                table: "Bookings",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "ServiceComboId",
                table: "Bookings",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ServiceId",
                table: "Bookings",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "UnitPrice",
                table: "Bookings",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Bookings",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AlterColumn<DateTime>(
                name: "APPLIED_AT",
                table: "BOOKING_COUPONS",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime",
                oldNullable: true,
                oldDefaultValueSql: "(getdate())");

            migrationBuilder.AlterColumn<DateTime>(
                name: "UPDATED_AT",
                table: "Accounts",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime",
                oldNullable: true,
                oldDefaultValueSql: "(getdate())");

            migrationBuilder.AlterColumn<string>(
                name: "Phone",
                table: "Accounts",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "varchar(10)",
                oldUnicode: false,
                oldMaxLength: 10,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "PASSWORD_HASH",
                table: "Accounts",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(32)",
                oldUnicode: false,
                oldMaxLength: 32);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "Accounts",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<bool>(
                name: "IS_ACTIVE",
                table: "Accounts",
                type: "bit",
                nullable: true,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldNullable: true,
                oldDefaultValueSql: "((1))");

            migrationBuilder.AlterColumn<string>(
                name: "Gender",
                table: "Accounts",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(10)",
                oldMaxLength: 10,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Accounts",
                type: "nvarchar(450)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<DateTime>(
                name: "Dob",
                table: "Accounts",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "date",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "CREATED_AT",
                table: "Accounts",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime",
                oldNullable: true,
                oldDefaultValueSql: "(getdate())");

            migrationBuilder.AlterColumn<string>(
                name: "Avatar",
                table: "Accounts",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Address",
                table: "Accounts",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsBanned",
                table: "Accounts",
                type: "bit",
                nullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "Quantity",
                table: "ServiceComboDetails",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true,
                oldDefaultValueSql: "((1))");

            migrationBuilder.AlterColumn<DateTime>(
                name: "Updated_At",
                table: "Services",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime",
                oldNullable: true,
                oldDefaultValueSql: "(getdate())");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "Services",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255);

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "Services",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "Created_At",
                table: "Services",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime",
                oldNullable: true,
                oldDefaultValueSql: "(getdate())");

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Otps",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Code",
                table: "Otps",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(10)",
                oldMaxLength: 10);

            migrationBuilder.AlterColumn<int>(
                name: "UserId",
                table: "Otps",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<bool>(
                name: "IsVerified",
                table: "Otps",
                type: "bit",
                nullable: true,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldNullable: true,
                oldDefaultValueSql: "((0))");

            migrationBuilder.AlterColumn<DateTime>(
                name: "ExpirationTime",
                table: "Otps",
                type: "datetime2",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "Otps",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime",
                oldNullable: true,
                oldDefaultValueSql: "(getdate())");

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "HostCertificates",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime",
                oldNullable: true,
                oldDefaultValueSql: "(getdate())");

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "HostCertificates",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50,
                oldNullable: true,
                oldDefaultValueSql: "('pending')");

            migrationBuilder.AlterColumn<string>(
                name: "ReviewComments",
                table: "HostCertificates",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(1000)",
                oldMaxLength: 1000);

            migrationBuilder.AlterColumn<string>(
                name: "RejectComment",
                table: "HostCertificates",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(1000)",
                oldMaxLength: 1000);

            migrationBuilder.AlterColumn<string>(
                name: "Phone",
                table: "HostCertificates",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20);

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "HostCertificates",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "HostCertificates",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime",
                oldNullable: true,
                oldDefaultValueSql: "(getdate())");

            migrationBuilder.AlterColumn<string>(
                name: "BusinessName",
                table: "HostCertificates",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255);

            migrationBuilder.AlterColumn<string>(
                name: "BusinessLicenseFile",
                table: "HostCertificates",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500);

            migrationBuilder.AlterColumn<string>(
                name: "Website",
                table: "AgencieCertificates",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "AgencieCertificates",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime",
                oldNullable: true,
                oldDefaultValueSql: "(getdate())");

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "AgencieCertificates",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50,
                oldNullable: true,
                oldDefaultValueSql: "('pending')");

            migrationBuilder.AlterColumn<string>(
                name: "ReviewComments",
                table: "AgencieCertificates",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(1000)",
                oldMaxLength: 1000);

            migrationBuilder.AlterColumn<string>(
                name: "RejectComment",
                table: "AgencieCertificates",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(1000)",
                oldMaxLength: 1000);

            migrationBuilder.AlterColumn<string>(
                name: "Phone",
                table: "AgencieCertificates",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20);

            migrationBuilder.AlterColumn<string>(
                name: "LicenseFile",
                table: "AgencieCertificates",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500);

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "AgencieCertificates",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "AgencieCertificates",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime",
                oldNullable: true,
                oldDefaultValueSql: "(getdate())");

            migrationBuilder.AlterColumn<string>(
                name: "Companyname",
                table: "AgencieCertificates",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Roles",
                table: "Roles",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Reviews",
                table: "Reviews",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Posts",
                table: "Posts",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Payments",
                table: "Payments",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Notifications",
                table: "Notifications",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_News",
                table: "News",
                column: "NewsId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Messages",
                table: "Messages",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Coupons",
                table: "Coupons",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Comments",
                table: "Comments",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Bookings",
                table: "Bookings",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Accounts",
                table: "Accounts",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ServiceComboDetails",
                table: "ServiceComboDetails",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Services",
                table: "Services",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Otps",
                table: "Otps",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_HostCertificates",
                table: "HostCertificates",
                column: "CertificateId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_AgencieCertificates",
                table: "AgencieCertificates",
                column: "AgencyId");

            migrationBuilder.CreateTable(
                name: "SystemLogs",
                columns: table => new
                {
                    LogId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    LogLevel = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Message = table.Column<string>(type: "nvarchar(MAX)", nullable: true),
                    StackTrace = table.Column<string>(type: "nvarchar(MAX)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: true),
                    Module = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SystemLogs", x => x.LogId);
                    table.ForeignKey(
                        name: "FK_SystemLogs_Accounts_UserId",
                        column: x => x.UserId,
                        principalTable: "Accounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SERVICECOMBO_HostId1",
                table: "SERVICECOMBO",
                column: "HostId1");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_AccountId",
                table: "Reviews",
                column: "AccountId");

            migrationBuilder.CreateIndex(
                name: "IX_Messages_ReceiverId",
                table: "Messages",
                column: "ReceiverId");

            migrationBuilder.CreateIndex(
                name: "IX_Comments_ParentCommentId",
                table: "Comments",
                column: "ParentCommentId");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_ServiceComboId",
                table: "Bookings",
                column: "ServiceComboId");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_ServiceId",
                table: "Bookings",
                column: "ServiceId");

            migrationBuilder.CreateIndex(
                name: "IX_SystemLogs_UserId",
                table: "SystemLogs",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Accounts_Roles_ROLE_ID",
                table: "Accounts",
                column: "ROLE_ID",
                principalTable: "Roles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AgencieCertificates_Accounts_AccountId",
                table: "AgencieCertificates",
                column: "AccountId",
                principalTable: "Accounts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_BOOKING_COUPONS_Bookings_BOOKING_ID",
                table: "BOOKING_COUPONS",
                column: "BOOKING_ID",
                principalTable: "Bookings",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_BOOKING_COUPONS_Coupons_COUPON_ID",
                table: "BOOKING_COUPONS",
                column: "COUPON_ID",
                principalTable: "Coupons",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Bookings_Accounts_UserId",
                table: "Bookings",
                column: "UserId",
                principalTable: "Accounts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Bookings_SERVICECOMBO_ServiceComboId",
                table: "Bookings",
                column: "ServiceComboId",
                principalTable: "SERVICECOMBO",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Bookings_Services_ServiceId",
                table: "Bookings",
                column: "ServiceId",
                principalTable: "Services",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Comments_Accounts_AuthorId",
                table: "Comments",
                column: "AuthorId",
                principalTable: "Accounts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Comments_Comments_ParentCommentId",
                table: "Comments",
                column: "ParentCommentId",
                principalTable: "Comments",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Comments_Posts_PostId",
                table: "Comments",
                column: "PostId",
                principalTable: "Posts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Coupons_Accounts_HostId",
                table: "Coupons",
                column: "HostId",
                principalTable: "Accounts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Coupons_SERVICECOMBO_ServiceComboId",
                table: "Coupons",
                column: "ServiceComboId",
                principalTable: "SERVICECOMBO",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_HostCertificates_Accounts_HostId",
                table: "HostCertificates",
                column: "HostId",
                principalTable: "Accounts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Messages_Accounts_ReceiverId",
                table: "Messages",
                column: "ReceiverId",
                principalTable: "Accounts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Messages_Accounts_SenderId",
                table: "Messages",
                column: "SenderId",
                principalTable: "Accounts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_News_Accounts_AccountId",
                table: "News",
                column: "AccountId",
                principalTable: "Accounts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Notifications_Accounts_UserId",
                table: "Notifications",
                column: "UserId",
                principalTable: "Accounts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Otps_Accounts_UserId",
                table: "Otps",
                column: "UserId",
                principalTable: "Accounts",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Payments_Bookings_BookingId",
                table: "Payments",
                column: "BookingId",
                principalTable: "Bookings",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Reviews_Accounts_AccountId",
                table: "Reviews",
                column: "AccountId",
                principalTable: "Accounts",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Reviews_Accounts_UserId",
                table: "Reviews",
                column: "UserId",
                principalTable: "Accounts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Reviews_Bookings_BookingId",
                table: "Reviews",
                column: "BookingId",
                principalTable: "Bookings",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SERVICECOMBO_Accounts_HOST_ID",
                table: "SERVICECOMBO",
                column: "HOST_ID",
                principalTable: "Accounts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SERVICECOMBO_Accounts_HostId1",
                table: "SERVICECOMBO",
                column: "HostId1",
                principalTable: "Accounts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ServiceComboDetails_SERVICECOMBO_ServiceComboId",
                table: "ServiceComboDetails",
                column: "ServiceComboId",
                principalTable: "SERVICECOMBO",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ServiceComboDetails_Services_ServiceId",
                table: "ServiceComboDetails",
                column: "ServiceId",
                principalTable: "Services",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Services_Accounts_HostId",
                table: "Services",
                column: "HostId",
                principalTable: "Accounts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Accounts_Roles_ROLE_ID",
                table: "Accounts");

            migrationBuilder.DropForeignKey(
                name: "FK_AgencieCertificates_Accounts_AccountId",
                table: "AgencieCertificates");

            migrationBuilder.DropForeignKey(
                name: "FK_BOOKING_COUPONS_Bookings_BOOKING_ID",
                table: "BOOKING_COUPONS");

            migrationBuilder.DropForeignKey(
                name: "FK_BOOKING_COUPONS_Coupons_COUPON_ID",
                table: "BOOKING_COUPONS");

            migrationBuilder.DropForeignKey(
                name: "FK_Bookings_Accounts_UserId",
                table: "Bookings");

            migrationBuilder.DropForeignKey(
                name: "FK_Bookings_SERVICECOMBO_ServiceComboId",
                table: "Bookings");

            migrationBuilder.DropForeignKey(
                name: "FK_Bookings_Services_ServiceId",
                table: "Bookings");

            migrationBuilder.DropForeignKey(
                name: "FK_Comments_Accounts_AuthorId",
                table: "Comments");

            migrationBuilder.DropForeignKey(
                name: "FK_Comments_Comments_ParentCommentId",
                table: "Comments");

            migrationBuilder.DropForeignKey(
                name: "FK_Comments_Posts_PostId",
                table: "Comments");

            migrationBuilder.DropForeignKey(
                name: "FK_Coupons_Accounts_HostId",
                table: "Coupons");

            migrationBuilder.DropForeignKey(
                name: "FK_Coupons_SERVICECOMBO_ServiceComboId",
                table: "Coupons");

            migrationBuilder.DropForeignKey(
                name: "FK_HostCertificates_Accounts_HostId",
                table: "HostCertificates");

            migrationBuilder.DropForeignKey(
                name: "FK_Messages_Accounts_ReceiverId",
                table: "Messages");

            migrationBuilder.DropForeignKey(
                name: "FK_Messages_Accounts_SenderId",
                table: "Messages");

            migrationBuilder.DropForeignKey(
                name: "FK_News_Accounts_AccountId",
                table: "News");

            migrationBuilder.DropForeignKey(
                name: "FK_Notifications_Accounts_UserId",
                table: "Notifications");

            migrationBuilder.DropForeignKey(
                name: "FK_Otps_Accounts_UserId",
                table: "Otps");

            migrationBuilder.DropForeignKey(
                name: "FK_Payments_Bookings_BookingId",
                table: "Payments");

            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_Accounts_AccountId",
                table: "Reviews");

            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_Accounts_UserId",
                table: "Reviews");

            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_Bookings_BookingId",
                table: "Reviews");

            migrationBuilder.DropForeignKey(
                name: "FK_SERVICECOMBO_Accounts_HOST_ID",
                table: "SERVICECOMBO");

            migrationBuilder.DropForeignKey(
                name: "FK_SERVICECOMBO_Accounts_HostId1",
                table: "SERVICECOMBO");

            migrationBuilder.DropForeignKey(
                name: "FK_ServiceComboDetails_SERVICECOMBO_ServiceComboId",
                table: "ServiceComboDetails");

            migrationBuilder.DropForeignKey(
                name: "FK_ServiceComboDetails_Services_ServiceId",
                table: "ServiceComboDetails");

            migrationBuilder.DropForeignKey(
                name: "FK_Services_Accounts_HostId",
                table: "Services");

            migrationBuilder.DropTable(
                name: "SystemLogs");

            migrationBuilder.DropIndex(
                name: "IX_SERVICECOMBO_HostId1",
                table: "SERVICECOMBO");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Roles",
                table: "Roles");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Reviews",
                table: "Reviews");

            migrationBuilder.DropIndex(
                name: "IX_Reviews_AccountId",
                table: "Reviews");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Posts",
                table: "Posts");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Payments",
                table: "Payments");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Notifications",
                table: "Notifications");

            migrationBuilder.DropPrimaryKey(
                name: "PK_News",
                table: "News");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Messages",
                table: "Messages");

            migrationBuilder.DropIndex(
                name: "IX_Messages_ReceiverId",
                table: "Messages");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Coupons",
                table: "Coupons");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Comments",
                table: "Comments");

            migrationBuilder.DropIndex(
                name: "IX_Comments_ParentCommentId",
                table: "Comments");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Bookings",
                table: "Bookings");

            migrationBuilder.DropIndex(
                name: "IX_Bookings_ServiceComboId",
                table: "Bookings");

            migrationBuilder.DropIndex(
                name: "IX_Bookings_ServiceId",
                table: "Bookings");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Accounts",
                table: "Accounts");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Services",
                table: "Services");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ServiceComboDetails",
                table: "ServiceComboDetails");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Otps",
                table: "Otps");

            migrationBuilder.DropPrimaryKey(
                name: "PK_HostCertificates",
                table: "HostCertificates");

            migrationBuilder.DropPrimaryKey(
                name: "PK_AgencieCertificates",
                table: "AgencieCertificates");

            migrationBuilder.DropColumn(
                name: "HostId1",
                table: "SERVICECOMBO");

            migrationBuilder.DropColumn(
                name: "Comment",
                table: "Reviews");

            migrationBuilder.DropColumn(
                name: "CreatedDate",
                table: "Reviews");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Reviews");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Payments");

            migrationBuilder.DropColumn(
                name: "PaymentMethod",
                table: "Payments");

            migrationBuilder.DropColumn(
                name: "TransactionId",
                table: "Payments");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Payments");

            migrationBuilder.DropColumn(
                name: "ExpiryDate",
                table: "Coupons");

            migrationBuilder.DropColumn(
                name: "BookingNumber",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "CompletedDate",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "ConfirmedDate",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "ItemType",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "ServiceComboId",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "ServiceId",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "UnitPrice",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "IsBanned",
                table: "Accounts");

            migrationBuilder.RenameTable(
                name: "Roles",
                newName: "ROLES");

            migrationBuilder.RenameTable(
                name: "Reviews",
                newName: "REVIEWS");

            migrationBuilder.RenameTable(
                name: "Posts",
                newName: "POSTS");

            migrationBuilder.RenameTable(
                name: "Payments",
                newName: "PAYMENTS");

            migrationBuilder.RenameTable(
                name: "Notifications",
                newName: "NOTIFICATIONS");

            migrationBuilder.RenameTable(
                name: "News",
                newName: "NEWS");

            migrationBuilder.RenameTable(
                name: "Messages",
                newName: "MESSAGES");

            migrationBuilder.RenameTable(
                name: "Coupons",
                newName: "COUPONS");

            migrationBuilder.RenameTable(
                name: "Comments",
                newName: "COMMENTS");

            migrationBuilder.RenameTable(
                name: "Bookings",
                newName: "BOOKINGS");

            migrationBuilder.RenameTable(
                name: "Accounts",
                newName: "ACCOUNTS");

            migrationBuilder.RenameTable(
                name: "Services",
                newName: "SERVICE");

            migrationBuilder.RenameTable(
                name: "ServiceComboDetails",
                newName: "SERVICECOMBO_DETAIL");

            migrationBuilder.RenameTable(
                name: "Otps",
                newName: "OTP");

            migrationBuilder.RenameTable(
                name: "HostCertificates",
                newName: "HOST_CERTIFICATES");

            migrationBuilder.RenameTable(
                name: "AgencieCertificates",
                newName: "AGENCIE_CERTIFICATES");

            migrationBuilder.RenameColumn(
                name: "Status",
                table: "SERVICECOMBO",
                newName: "STATUS");

            migrationBuilder.RenameColumn(
                name: "Price",
                table: "SERVICECOMBO",
                newName: "PRICE");

            migrationBuilder.RenameColumn(
                name: "Name",
                table: "SERVICECOMBO",
                newName: "NAME");

            migrationBuilder.RenameColumn(
                name: "Image",
                table: "SERVICECOMBO",
                newName: "IMAGE");

            migrationBuilder.RenameColumn(
                name: "Description",
                table: "SERVICECOMBO",
                newName: "DESCRIPTION");

            migrationBuilder.RenameColumn(
                name: "Address",
                table: "SERVICECOMBO",
                newName: "ADDRESS");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "SERVICECOMBO",
                newName: "ID");

            migrationBuilder.RenameColumn(
                name: "Name",
                table: "ROLES",
                newName: "NAME");

            migrationBuilder.RenameColumn(
                name: "Description",
                table: "ROLES",
                newName: "DESCRIPTION");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "ROLES",
                newName: "ID");

            migrationBuilder.RenameIndex(
                name: "IX_Roles_Name",
                table: "ROLES",
                newName: "UQ__ROLES__D9C1FA000635C206");

            migrationBuilder.RenameColumn(
                name: "Rating",
                table: "REVIEWS",
                newName: "RATING");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "REVIEWS",
                newName: "ID");

            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "REVIEWS",
                newName: "COMBO_ID");

            migrationBuilder.RenameColumn(
                name: "BookingId",
                table: "REVIEWS",
                newName: "AUTHOR_ID");

            migrationBuilder.RenameColumn(
                name: "AccountId",
                table: "REVIEWS",
                newName: "PARENT_REVIEW_ID");

            migrationBuilder.RenameIndex(
                name: "IX_Reviews_UserId",
                table: "REVIEWS",
                newName: "IX_REVIEWS_COMBO_ID");

            migrationBuilder.RenameIndex(
                name: "IX_Reviews_BookingId",
                table: "REVIEWS",
                newName: "IX_REVIEWS_AUTHOR_ID");

            migrationBuilder.RenameColumn(
                name: "Title",
                table: "POSTS",
                newName: "TITLE");

            migrationBuilder.RenameColumn(
                name: "Image",
                table: "POSTS",
                newName: "IMAGE");

            migrationBuilder.RenameColumn(
                name: "Content",
                table: "POSTS",
                newName: "CONTENT");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "POSTS",
                newName: "ID");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "POSTS",
                newName: "UPDATED_AT");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "POSTS",
                newName: "CREATED_AT");

            migrationBuilder.RenameColumn(
                name: "AuthorId",
                table: "POSTS",
                newName: "AUTHOR_ID");

            migrationBuilder.RenameColumn(
                name: "Status",
                table: "PAYMENTS",
                newName: "STATUS");

            migrationBuilder.RenameColumn(
                name: "Amount",
                table: "PAYMENTS",
                newName: "AMOUNT");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "PAYMENTS",
                newName: "ID");

            migrationBuilder.RenameColumn(
                name: "PaymentDate",
                table: "PAYMENTS",
                newName: "PAYMENT_DATE");

            migrationBuilder.RenameColumn(
                name: "BookingId",
                table: "PAYMENTS",
                newName: "BOOKING_ID");

            migrationBuilder.RenameIndex(
                name: "IX_Payments_BookingId",
                table: "PAYMENTS",
                newName: "IX_PAYMENTS_BOOKING_ID");

            migrationBuilder.RenameColumn(
                name: "Message",
                table: "NOTIFICATIONS",
                newName: "MESSAGE");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "NOTIFICATIONS",
                newName: "ID");

            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "NOTIFICATIONS",
                newName: "USER_ID");

            migrationBuilder.RenameColumn(
                name: "IsRead",
                table: "NOTIFICATIONS",
                newName: "IS_READ");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "NOTIFICATIONS",
                newName: "CREATED_AT");

            migrationBuilder.RenameIndex(
                name: "IX_Notifications_UserId",
                table: "NOTIFICATIONS",
                newName: "IX_NOTIFICATIONS_USER_ID");

            migrationBuilder.RenameIndex(
                name: "IX_News_AccountId",
                table: "NEWS",
                newName: "IX_NEWS_AccountId");

            migrationBuilder.RenameColumn(
                name: "Content",
                table: "MESSAGES",
                newName: "CONTENT");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "MESSAGES",
                newName: "ID");

            migrationBuilder.RenameColumn(
                name: "SenderId",
                table: "MESSAGES",
                newName: "SENDER_ID");

            migrationBuilder.RenameColumn(
                name: "ReceiverId",
                table: "MESSAGES",
                newName: "RECEIVER_ID");

            migrationBuilder.RenameColumn(
                name: "IsRead",
                table: "MESSAGES",
                newName: "IS_READ");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "MESSAGES",
                newName: "CREATED_AT");

            migrationBuilder.RenameIndex(
                name: "IX_Messages_SenderId",
                table: "MESSAGES",
                newName: "IX_MESSAGES_SENDER_ID");

            migrationBuilder.RenameColumn(
                name: "Description",
                table: "COUPONS",
                newName: "DESCRIPTION");

            migrationBuilder.RenameColumn(
                name: "Code",
                table: "COUPONS",
                newName: "CODE");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "COUPONS",
                newName: "ID");

            migrationBuilder.RenameColumn(
                name: "UsageLimit",
                table: "COUPONS",
                newName: "USAGE_LIMIT");

            migrationBuilder.RenameColumn(
                name: "UsageCount",
                table: "COUPONS",
                newName: "USAGE_COUNT");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "COUPONS",
                newName: "UPDATED_AT");

            migrationBuilder.RenameColumn(
                name: "ServiceComboId",
                table: "COUPONS",
                newName: "SERVICECOMBO_ID");

            migrationBuilder.RenameColumn(
                name: "IsActive",
                table: "COUPONS",
                newName: "IS_ACTIVE");

            migrationBuilder.RenameColumn(
                name: "HostId",
                table: "COUPONS",
                newName: "HOST_ID");

            migrationBuilder.RenameColumn(
                name: "DiscountPercent",
                table: "COUPONS",
                newName: "DISCOUNT_PERCENT");

            migrationBuilder.RenameColumn(
                name: "DiscountAmount",
                table: "COUPONS",
                newName: "DISCOUNT_AMOUNT");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "COUPONS",
                newName: "CREATED_AT");

            migrationBuilder.RenameIndex(
                name: "IX_Coupons_ServiceComboId",
                table: "COUPONS",
                newName: "IX_COUPONS_SERVICECOMBO_ID");

            migrationBuilder.RenameIndex(
                name: "IX_Coupons_HostId",
                table: "COUPONS",
                newName: "IX_COUPONS_HOST_ID");

            migrationBuilder.RenameIndex(
                name: "IX_Coupons_Code",
                table: "COUPONS",
                newName: "UQ__COUPONS__AA1D4379B4900E43");

            migrationBuilder.RenameColumn(
                name: "Content",
                table: "COMMENTS",
                newName: "CONTENT");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "COMMENTS",
                newName: "ID");

            migrationBuilder.RenameColumn(
                name: "PostId",
                table: "COMMENTS",
                newName: "POST_ID");

            migrationBuilder.RenameColumn(
                name: "ParentCommentId",
                table: "COMMENTS",
                newName: "PARENT_COMMENT_ID");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "COMMENTS",
                newName: "CREATED_AT");

            migrationBuilder.RenameColumn(
                name: "AuthorId",
                table: "COMMENTS",
                newName: "AUTHOR_ID");

            migrationBuilder.RenameIndex(
                name: "IX_Comments_PostId",
                table: "COMMENTS",
                newName: "IX_COMMENTS_POST_ID");

            migrationBuilder.RenameIndex(
                name: "IX_Comments_AuthorId",
                table: "COMMENTS",
                newName: "IX_COMMENTS_AUTHOR_ID");

            migrationBuilder.RenameColumn(
                name: "Status",
                table: "BOOKINGS",
                newName: "STATUS");

            migrationBuilder.RenameColumn(
                name: "Quantity",
                table: "BOOKINGS",
                newName: "QUANTITY");

            migrationBuilder.RenameColumn(
                name: "Notes",
                table: "BOOKINGS",
                newName: "NOTES");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "BOOKINGS",
                newName: "ID");

            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "BOOKINGS",
                newName: "USER_ID");

            migrationBuilder.RenameColumn(
                name: "TotalAmount",
                table: "BOOKINGS",
                newName: "TOTAL_AMOUNT");

            migrationBuilder.RenameColumn(
                name: "BookingDate",
                table: "BOOKINGS",
                newName: "BOOKING_DATE");

            migrationBuilder.RenameIndex(
                name: "IX_Bookings_UserId",
                table: "BOOKINGS",
                newName: "IX_BOOKINGS_USER_ID");

            migrationBuilder.RenameIndex(
                name: "IX_BOOKING_COUPONS_BOOKING_ID_COUPON_ID",
                table: "BOOKING_COUPONS",
                newName: "UQ_BookingPromotion");

            migrationBuilder.RenameColumn(
                name: "Phone",
                table: "ACCOUNTS",
                newName: "PHONE");

            migrationBuilder.RenameColumn(
                name: "Name",
                table: "ACCOUNTS",
                newName: "NAME");

            migrationBuilder.RenameColumn(
                name: "Gender",
                table: "ACCOUNTS",
                newName: "GENDER");

            migrationBuilder.RenameColumn(
                name: "Email",
                table: "ACCOUNTS",
                newName: "EMAIL");

            migrationBuilder.RenameColumn(
                name: "Dob",
                table: "ACCOUNTS",
                newName: "DOB");

            migrationBuilder.RenameColumn(
                name: "Avatar",
                table: "ACCOUNTS",
                newName: "AVATAR");

            migrationBuilder.RenameColumn(
                name: "Address",
                table: "ACCOUNTS",
                newName: "ADDRESS");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "ACCOUNTS",
                newName: "ID");

            migrationBuilder.RenameIndex(
                name: "IX_Accounts_ROLE_ID",
                table: "ACCOUNTS",
                newName: "IX_ACCOUNTS_ROLE_ID");

            migrationBuilder.RenameIndex(
                name: "IX_Accounts_Email",
                table: "ACCOUNTS",
                newName: "UQ__ACCOUNTS__161CF724757E8893");

            migrationBuilder.RenameColumn(
                name: "Updated_At",
                table: "SERVICE",
                newName: "UPDATED_AT");

            migrationBuilder.RenameColumn(
                name: "Price",
                table: "SERVICE",
                newName: "PRICE");

            migrationBuilder.RenameColumn(
                name: "Name",
                table: "SERVICE",
                newName: "NAME");

            migrationBuilder.RenameColumn(
                name: "Description",
                table: "SERVICE",
                newName: "DESCRIPTION");

            migrationBuilder.RenameColumn(
                name: "Created_At",
                table: "SERVICE",
                newName: "CREATED_AT");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "SERVICE",
                newName: "ID");

            migrationBuilder.RenameColumn(
                name: "HostId",
                table: "SERVICE",
                newName: "HOST_ID");

            migrationBuilder.RenameIndex(
                name: "IX_Services_HostId",
                table: "SERVICE",
                newName: "IX_SERVICE_HOST_ID");

            migrationBuilder.RenameColumn(
                name: "Quantity",
                table: "SERVICECOMBO_DETAIL",
                newName: "QUANTITY");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "SERVICECOMBO_DETAIL",
                newName: "ID");

            migrationBuilder.RenameColumn(
                name: "ServiceId",
                table: "SERVICECOMBO_DETAIL",
                newName: "SERVICE_ID");

            migrationBuilder.RenameColumn(
                name: "ServiceComboId",
                table: "SERVICECOMBO_DETAIL",
                newName: "SERVICECOMBO_ID");

            migrationBuilder.RenameIndex(
                name: "IX_ServiceComboDetails_ServiceId",
                table: "SERVICECOMBO_DETAIL",
                newName: "IX_SERVICECOMBO_DETAIL_SERVICE_ID");

            migrationBuilder.RenameIndex(
                name: "IX_ServiceComboDetails_ServiceComboId",
                table: "SERVICECOMBO_DETAIL",
                newName: "IX_SERVICECOMBO_DETAIL_SERVICECOMBO_ID");

            migrationBuilder.RenameColumn(
                name: "Email",
                table: "OTP",
                newName: "EMAIL");

            migrationBuilder.RenameColumn(
                name: "Code",
                table: "OTP",
                newName: "CODE");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "OTP",
                newName: "ID");

            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "OTP",
                newName: "USER_ID");

            migrationBuilder.RenameColumn(
                name: "IsVerified",
                table: "OTP",
                newName: "IS_VERIFIED");

            migrationBuilder.RenameColumn(
                name: "ExpirationTime",
                table: "OTP",
                newName: "EXPIRATION_TIME");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "OTP",
                newName: "CREATED_AT");

            migrationBuilder.RenameIndex(
                name: "IX_Otps_UserId",
                table: "OTP",
                newName: "IX_OTP_USER_ID");

            migrationBuilder.RenameIndex(
                name: "IX_HostCertificates_HostId",
                table: "HOST_CERTIFICATES",
                newName: "IX_HOST_CERTIFICATES_HostId");

            migrationBuilder.RenameColumn(
                name: "Companyname",
                table: "AGENCIE_CERTIFICATES",
                newName: "COMPANYNAME");

            migrationBuilder.RenameIndex(
                name: "IX_AgencieCertificates_AccountId",
                table: "AGENCIE_CERTIFICATES",
                newName: "IX_AGENCIE_CERTIFICATES_AccountId");

            migrationBuilder.AlterColumn<DateTime>(
                name: "UPDATED_AT",
                table: "SERVICECOMBO",
                type: "datetime",
                nullable: true,
                defaultValueSql: "(getdate())",
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AlterColumn<string>(
                name: "STATUS",
                table: "SERVICECOMBO",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true,
                defaultValueSql: "('open')",
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<DateTime>(
                name: "CREATED_AT",
                table: "SERVICECOMBO",
                type: "datetime",
                nullable: true,
                defaultValueSql: "(getdate())",
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AlterColumn<string>(
                name: "NAME",
                table: "ROLES",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");

            migrationBuilder.AlterColumn<string>(
                name: "DESCRIPTION",
                table: "ROLES",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "RATING",
                table: "REVIEWS",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<string>(
                name: "CONTENT",
                table: "REVIEWS",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "CREATED_AT",
                table: "REVIEWS",
                type: "datetime",
                nullable: true,
                defaultValueSql: "(getdate())");

            migrationBuilder.AlterColumn<string>(
                name: "TITLE",
                table: "POSTS",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "IMAGE",
                table: "POSTS",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<DateTime>(
                name: "UPDATED_AT",
                table: "POSTS",
                type: "datetime",
                nullable: true,
                defaultValueSql: "(getdate())",
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CREATED_AT",
                table: "POSTS",
                type: "datetime",
                nullable: true,
                defaultValueSql: "(getdate())",
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AlterColumn<string>(
                name: "STATUS",
                table: "PAYMENTS",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true,
                defaultValueSql: "('pending')",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<DateTime>(
                name: "PAYMENT_DATE",
                table: "PAYMENTS",
                type: "datetime",
                nullable: true,
                defaultValueSql: "(getdate())",
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "METHOD",
                table: "PAYMENTS",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "MESSAGE",
                table: "NOTIFICATIONS",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "IS_READ",
                table: "NOTIFICATIONS",
                type: "bit",
                nullable: true,
                defaultValueSql: "((0))",
                oldClrType: typeof(bool),
                oldType: "bit",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "CREATED_AT",
                table: "NOTIFICATIONS",
                type: "datetime",
                nullable: true,
                defaultValueSql: "(getdate())",
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedDate",
                table: "NEWS",
                type: "datetime",
                nullable: true,
                defaultValueSql: "(getdate())",
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AlterColumn<string>(
                name: "CONTENT",
                table: "MESSAGES",
                type: "nvarchar(2000)",
                maxLength: 2000,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<bool>(
                name: "IS_READ",
                table: "MESSAGES",
                type: "bit",
                nullable: true,
                defaultValueSql: "((0))",
                oldClrType: typeof(bool),
                oldType: "bit",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "CREATED_AT",
                table: "MESSAGES",
                type: "datetime",
                nullable: true,
                defaultValueSql: "(getdate())",
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "USAGE_COUNT",
                table: "COUPONS",
                type: "int",
                nullable: true,
                defaultValueSql: "((0))",
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<DateTime>(
                name: "UPDATED_AT",
                table: "COUPONS",
                type: "datetime",
                nullable: true,
                defaultValueSql: "(getdate())",
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AlterColumn<int>(
                name: "SERVICECOMBO_ID",
                table: "COUPONS",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "IS_ACTIVE",
                table: "COUPONS",
                type: "bit",
                nullable: true,
                defaultValueSql: "((1))",
                oldClrType: typeof(bool),
                oldType: "bit");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CREATED_AT",
                table: "COUPONS",
                type: "datetime",
                nullable: true,
                defaultValueSql: "(getdate())",
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CREATED_AT",
                table: "COMMENTS",
                type: "datetime",
                nullable: true,
                defaultValueSql: "(getdate())",
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "IMAGE",
                table: "COMMENTS",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "STATUS",
                table: "BOOKINGS",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true,
                defaultValueSql: "('pending')",
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "NOTES",
                table: "BOOKINGS",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(1000)",
                oldMaxLength: 1000,
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "BOOKING_DATE",
                table: "BOOKINGS",
                type: "datetime",
                nullable: true,
                defaultValueSql: "(getdate())",
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AddColumn<int>(
                name: "COMBO_ID",
                table: "BOOKINGS",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "END_DATE",
                table: "BOOKINGS",
                type: "date",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "START_DATE",
                table: "BOOKINGS",
                type: "date",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AlterColumn<DateTime>(
                name: "APPLIED_AT",
                table: "BOOKING_COUPONS",
                type: "datetime",
                nullable: true,
                defaultValueSql: "(getdate())",
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AlterColumn<DateTime>(
                name: "UPDATED_AT",
                table: "ACCOUNTS",
                type: "datetime",
                nullable: true,
                defaultValueSql: "(getdate())",
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "PHONE",
                table: "ACCOUNTS",
                type: "varchar(10)",
                unicode: false,
                maxLength: 10,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "PASSWORD_HASH",
                table: "ACCOUNTS",
                type: "varchar(32)",
                unicode: false,
                maxLength: 32,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "NAME",
                table: "ACCOUNTS",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<bool>(
                name: "IS_ACTIVE",
                table: "ACCOUNTS",
                type: "bit",
                nullable: true,
                defaultValueSql: "((1))",
                oldClrType: typeof(bool),
                oldType: "bit",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "GENDER",
                table: "ACCOUNTS",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "EMAIL",
                table: "ACCOUNTS",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");

            migrationBuilder.AlterColumn<DateTime>(
                name: "DOB",
                table: "ACCOUNTS",
                type: "date",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "CREATED_AT",
                table: "ACCOUNTS",
                type: "datetime",
                nullable: true,
                defaultValueSql: "(getdate())",
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "AVATAR",
                table: "ACCOUNTS",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ADDRESS",
                table: "ACCOUNTS",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PASSWORD_SALT",
                table: "ACCOUNTS",
                type: "varchar(32)",
                unicode: false,
                maxLength: 32,
                nullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "UPDATED_AT",
                table: "SERVICE",
                type: "datetime",
                nullable: true,
                defaultValueSql: "(getdate())",
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AlterColumn<string>(
                name: "NAME",
                table: "SERVICE",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "DESCRIPTION",
                table: "SERVICE",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "CREATED_AT",
                table: "SERVICE",
                type: "datetime",
                nullable: true,
                defaultValueSql: "(getdate())",
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AlterColumn<int>(
                name: "QUANTITY",
                table: "SERVICECOMBO_DETAIL",
                type: "int",
                nullable: true,
                defaultValueSql: "((1))",
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<string>(
                name: "EMAIL",
                table: "OTP",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CODE",
                table: "OTP",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<int>(
                name: "USER_ID",
                table: "OTP",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "IS_VERIFIED",
                table: "OTP",
                type: "bit",
                nullable: true,
                defaultValueSql: "((0))",
                oldClrType: typeof(bool),
                oldType: "bit",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "EXPIRATION_TIME",
                table: "OTP",
                type: "datetime",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CREATED_AT",
                table: "OTP",
                type: "datetime",
                nullable: true,
                defaultValueSql: "(getdate())",
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "HOST_CERTIFICATES",
                type: "datetime",
                nullable: true,
                defaultValueSql: "(getdate())",
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "HOST_CERTIFICATES",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true,
                defaultValueSql: "('pending')",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ReviewComments",
                table: "HOST_CERTIFICATES",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "RejectComment",
                table: "HOST_CERTIFICATES",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Phone",
                table: "HOST_CERTIFICATES",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "HOST_CERTIFICATES",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "HOST_CERTIFICATES",
                type: "datetime",
                nullable: true,
                defaultValueSql: "(getdate())",
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "BusinessName",
                table: "HOST_CERTIFICATES",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "BusinessLicenseFile",
                table: "HOST_CERTIFICATES",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<string>(
                name: "Image",
                table: "HOST_CERTIFICATES",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<string>(
                name: "Website",
                table: "AGENCIE_CERTIFICATES",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "AGENCIE_CERTIFICATES",
                type: "datetime",
                nullable: true,
                defaultValueSql: "(getdate())",
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "AGENCIE_CERTIFICATES",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true,
                defaultValueSql: "('pending')",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ReviewComments",
                table: "AGENCIE_CERTIFICATES",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "RejectComment",
                table: "AGENCIE_CERTIFICATES",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Phone",
                table: "AGENCIE_CERTIFICATES",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "LicenseFile",
                table: "AGENCIE_CERTIFICATES",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "AGENCIE_CERTIFICATES",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "AGENCIE_CERTIFICATES",
                type: "datetime",
                nullable: true,
                defaultValueSql: "(getdate())",
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "COMPANYNAME",
                table: "AGENCIE_CERTIFICATES",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<string>(
                name: "Image",
                table: "AGENCIE_CERTIFICATES",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ROLES",
                table: "ROLES",
                column: "ID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_REVIEWS",
                table: "REVIEWS",
                column: "ID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_POSTS",
                table: "POSTS",
                column: "ID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_PAYMENTS",
                table: "PAYMENTS",
                column: "ID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_NOTIFICATIONS",
                table: "NOTIFICATIONS",
                column: "ID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_NEWS",
                table: "NEWS",
                column: "NewsId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_MESSAGES",
                table: "MESSAGES",
                column: "ID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_COUPONS",
                table: "COUPONS",
                column: "ID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_COMMENTS",
                table: "COMMENTS",
                column: "ID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_BOOKINGS",
                table: "BOOKINGS",
                column: "ID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ACCOUNTS",
                table: "ACCOUNTS",
                column: "ID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_SERVICE",
                table: "SERVICE",
                column: "ID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_SERVICECOMBO_DETAIL",
                table: "SERVICECOMBO_DETAIL",
                column: "ID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_OTP",
                table: "OTP",
                column: "ID");

            migrationBuilder.AddPrimaryKey(
                name: "PK__HOST_CER__BBF8A7C1722F012C",
                table: "HOST_CERTIFICATES",
                column: "CertificateId");

            migrationBuilder.AddPrimaryKey(
                name: "PK__AGENCIE___95C546DB5FDFFD15",
                table: "AGENCIE_CERTIFICATES",
                column: "AgencyId");

            migrationBuilder.CreateTable(
                name: "REACTIONS",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    USER_ID = table.Column<int>(type: "int", nullable: false),
                    CREATED_AT = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    REACTION_TYPE = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    TARGET_ID = table.Column<int>(type: "int", nullable: false),
                    TARGET_TYPE = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_REACTIONS", x => x.ID);
                    table.ForeignKey(
                        name: "FK__REACTIONS__USER___7D439ABD",
                        column: x => x.USER_ID,
                        principalTable: "ACCOUNTS",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "REQUEST_SUPPORTS",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    COMBO_ID = table.Column<int>(type: "int", nullable: true),
                    USER_ID = table.Column<int>(type: "int", nullable: false),
                    CONTENT = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    CREATED_AT = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    IMAGE = table.Column<string>(type: "varchar(255)", unicode: false, maxLength: 255, nullable: true),
                    STATUS = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true, defaultValueSql: "('Pending')"),
                    SUPPORT_TYPE = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    UPDATED_AT = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_REQUEST_SUPPORTS", x => x.ID);
                    table.ForeignKey(
                        name: "FK__REQUEST_S__COMBO__09A971A2",
                        column: x => x.COMBO_ID,
                        principalTable: "SERVICECOMBO",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK__REQUEST_S__USER___08B54D69",
                        column: x => x.USER_ID,
                        principalTable: "ACCOUNTS",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "SUPPORT_RESPONSES",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RESPONDER_ID = table.Column<int>(type: "int", nullable: false),
                    SUPPORT_ID = table.Column<int>(type: "int", nullable: false),
                    CONTENT = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    CREATED_AT = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    IMAGE = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SUPPORT_RESPONSES", x => x.ID);
                    table.ForeignKey(
                        name: "FK__SUPPORT_R__RESPO__0E6E26BF",
                        column: x => x.RESPONDER_ID,
                        principalTable: "ACCOUNTS",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK__SUPPORT_R__SUPPO__0D7A0286",
                        column: x => x.SUPPORT_ID,
                        principalTable: "REQUEST_SUPPORTS",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateIndex(
                name: "IX_POSTS_AUTHOR_ID",
                table: "POSTS",
                column: "AUTHOR_ID");

            migrationBuilder.CreateIndex(
                name: "IX_BOOKINGS_COMBO_ID",
                table: "BOOKINGS",
                column: "COMBO_ID");

            migrationBuilder.CreateIndex(
                name: "IX_REACTIONS_USER_ID",
                table: "REACTIONS",
                column: "USER_ID");

            migrationBuilder.CreateIndex(
                name: "IX_REQUEST_SUPPORTS_COMBO_ID",
                table: "REQUEST_SUPPORTS",
                column: "COMBO_ID");

            migrationBuilder.CreateIndex(
                name: "IX_REQUEST_SUPPORTS_USER_ID",
                table: "REQUEST_SUPPORTS",
                column: "USER_ID");

            migrationBuilder.CreateIndex(
                name: "IX_SUPPORT_RESPONSES_RESPONDER_ID",
                table: "SUPPORT_RESPONSES",
                column: "RESPONDER_ID");

            migrationBuilder.CreateIndex(
                name: "IX_SUPPORT_RESPONSES_SUPPORT_ID",
                table: "SUPPORT_RESPONSES",
                column: "SUPPORT_ID");

            migrationBuilder.AddForeignKey(
                name: "FK__ACCOUNTS__ROLE_I__2B3F6F97",
                table: "ACCOUNTS",
                column: "ROLE_ID",
                principalTable: "ROLES",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK__AGENCIE_C__Accou__3B75D760",
                table: "AGENCIE_CERTIFICATES",
                column: "AccountId",
                principalTable: "ACCOUNTS",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK__BOOKING_C__BOOKI__5EBF139D",
                table: "BOOKING_COUPONS",
                column: "BOOKING_ID",
                principalTable: "BOOKINGS",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK__BOOKING_C__COUPO__5FB337D6",
                table: "BOOKING_COUPONS",
                column: "COUPON_ID",
                principalTable: "COUPONS",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK__BOOKINGS__COMBO___59FA5E80",
                table: "BOOKINGS",
                column: "COMBO_ID",
                principalTable: "SERVICECOMBO",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK__BOOKINGS__USER_I__59063A47",
                table: "BOOKINGS",
                column: "USER_ID",
                principalTable: "ACCOUNTS",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK__COMMENTS__AUTHOR__787EE5A0",
                table: "COMMENTS",
                column: "AUTHOR_ID",
                principalTable: "ACCOUNTS",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK__COMMENTS__POST_I__778AC167",
                table: "COMMENTS",
                column: "POST_ID",
                principalTable: "POSTS",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK__COUPONS__HOST_ID__52593CB8",
                table: "COUPONS",
                column: "HOST_ID",
                principalTable: "ACCOUNTS",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK__COUPONS__SERVICE__534D60F1",
                table: "COUPONS",
                column: "SERVICECOMBO_ID",
                principalTable: "SERVICECOMBO",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK__HOST_CERT__HostI__35BCFE0A",
                table: "HOST_CERTIFICATES",
                column: "HostId",
                principalTable: "ACCOUNTS",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK__MESSAGES__SENDER__02084FDA",
                table: "MESSAGES",
                column: "SENDER_ID",
                principalTable: "ACCOUNTS",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK__NEWS__AccountId__123EB7A3",
                table: "NEWS",
                column: "AccountId",
                principalTable: "ACCOUNTS",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK__NOTIFICAT__USER___6EF57B66",
                table: "NOTIFICATIONS",
                column: "USER_ID",
                principalTable: "ACCOUNTS",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK__OTP__USER_ID__300424B4",
                table: "OTP",
                column: "USER_ID",
                principalTable: "ACCOUNTS",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK__PAYMENTS__BOOKIN__6477ECF3",
                table: "PAYMENTS",
                column: "BOOKING_ID",
                principalTable: "BOOKINGS",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK__POSTS__AUTHOR_ID__73BA3083",
                table: "POSTS",
                column: "AUTHOR_ID",
                principalTable: "ACCOUNTS",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK__REVIEWS__AUTHOR___693CA210",
                table: "REVIEWS",
                column: "AUTHOR_ID",
                principalTable: "ACCOUNTS",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK__REVIEWS__COMBO_I__68487DD7",
                table: "REVIEWS",
                column: "COMBO_ID",
                principalTable: "SERVICECOMBO",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK__SERVICE__HOST_ID__403A8C7D",
                table: "SERVICE",
                column: "HOST_ID",
                principalTable: "ACCOUNTS",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK__SERVICECO__HOST___45F365D3",
                table: "SERVICECOMBO",
                column: "HOST_ID",
                principalTable: "ACCOUNTS",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK__SERVICECO__SERVI__49C3F6B7",
                table: "SERVICECOMBO_DETAIL",
                column: "SERVICECOMBO_ID",
                principalTable: "SERVICECOMBO",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK__SERVICECO__SERVI__4AB81AF0",
                table: "SERVICECOMBO_DETAIL",
                column: "SERVICE_ID",
                principalTable: "SERVICE",
                principalColumn: "ID");
        }
    }
}
