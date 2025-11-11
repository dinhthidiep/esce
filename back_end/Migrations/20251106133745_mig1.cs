using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ESCE_SYSTEM.Migrations
{
    public partial class mig1 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ROLES",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NAME = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    DESCRIPTION = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ROLES", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "SYSTEM_LOGS",
                columns: table => new
                {
                    LogId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    LogLevel = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Message = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StackTrace = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    UserId = table.Column<int>(type: "int", nullable: true),
                    Module = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__SYSTEM_L__5E5486488ADB87BA", x => x.LogId);
                });

            migrationBuilder.CreateTable(
                name: "ACCOUNTS",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NAME = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    EMAIL = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PASSWORD_HASH = table.Column<string>(type: "varchar(500)", unicode: false, maxLength: 500, nullable: false),
                    PASSWORD = table.Column<string>(type: "varchar(32)", unicode: false, maxLength: 32, nullable: true),
                    AVATAR = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    PHONE = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: true),
                    DOB = table.Column<DateTime>(type: "date", nullable: true),
                    GENDER = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    ADDRESS = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    IS_ACTIVE = table.Column<bool>(type: "bit", nullable: false, defaultValueSql: "((1))"),
                    CREATED_AT = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    UPDATED_AT = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    ROLE_ID = table.Column<int>(type: "int", nullable: false),
                    IsBanned = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ACCOUNTS", x => x.ID);
                    table.ForeignKey(
                        name: "FK__ACCOUNTS__ROLE_I__3F466844",
                        column: x => x.ROLE_ID,
                        principalTable: "ROLES",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "AGENCIE_CERTIFICATES",
                columns: table => new
                {
                    AgencyId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AccountId = table.Column<int>(type: "int", nullable: false),
                    COMPANYNAME = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    LicenseFile = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Website = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true, defaultValueSql: "('pending')"),
                    RejectComment = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    ReviewComments = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__AGENCIE___95C546DBEE22E00D", x => x.AgencyId);
                    table.ForeignKey(
                        name: "FK__AGENCIE_C__Accou__4F7CD00D",
                        column: x => x.AccountId,
                        principalTable: "ACCOUNTS",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "HOST_CERTIFICATES",
                columns: table => new
                {
                    CertificateId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    HostId = table.Column<int>(type: "int", nullable: false),
                    BusinessLicenseFile = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    BusinessName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true, defaultValueSql: "('pending')"),
                    RejectComment = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    ReviewComments = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__HOST_CER__BBF8A7C16A0E9C16", x => x.CertificateId);
                    table.ForeignKey(
                        name: "FK__HOST_CERT__HostI__49C3F6B7",
                        column: x => x.HostId,
                        principalTable: "ACCOUNTS",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "MESSAGES",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SENDER_ID = table.Column<int>(type: "int", nullable: false),
                    RECEIVER_ID = table.Column<int>(type: "int", nullable: false),
                    CONTENT = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    CREATED_AT = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    IS_READ = table.Column<bool>(type: "bit", nullable: true, defaultValueSql: "((0))")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MESSAGES", x => x.ID);
                    table.ForeignKey(
                        name: "FK__MESSAGES__RECEIV__17036CC0",
                        column: x => x.RECEIVER_ID,
                        principalTable: "ACCOUNTS",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK__MESSAGES__SENDER__160F4887",
                        column: x => x.SENDER_ID,
                        principalTable: "ACCOUNTS",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "NEWS",
                columns: table => new
                {
                    NewsId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AccountId = table.Column<int>(type: "int", nullable: false),
                    NewsTitle = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    Image = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    SocialMediaLink = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NEWS", x => x.NewsId);
                    table.ForeignKey(
                        name: "FK__NEWS__AccountId__2645B050",
                        column: x => x.AccountId,
                        principalTable: "ACCOUNTS",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "NOTIFICATIONS",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    USER_ID = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    MESSAGE = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IS_READ = table.Column<bool>(type: "bit", nullable: true, defaultValueSql: "((0))"),
                    CREATED_AT = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NOTIFICATIONS", x => x.ID);
                    table.ForeignKey(
                        name: "FK__NOTIFICAT__USER___02FC7413",
                        column: x => x.USER_ID,
                        principalTable: "ACCOUNTS",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "OTP",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    USER_ID = table.Column<int>(type: "int", nullable: false),
                    CODE = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    EMAIL = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    EXPIRATION_TIME = table.Column<DateTime>(type: "datetime", nullable: false),
                    IS_VERIFIED = table.Column<bool>(type: "bit", nullable: true, defaultValueSql: "((0))"),
                    CREATED_AT = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OTP", x => x.ID);
                    table.ForeignKey(
                        name: "FK__OTP__USER_ID__440B1D61",
                        column: x => x.USER_ID,
                        principalTable: "ACCOUNTS",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "POSTS",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TITLE = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    CONTENT = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AUTHOR_ID = table.Column<int>(type: "int", nullable: false),
                    Image = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CREATED_AT = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    UPDATED_AT = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_POSTS", x => x.ID);
                    table.ForeignKey(
                        name: "FK__POSTS__AUTHOR_ID__07C12930",
                        column: x => x.AUTHOR_ID,
                        principalTable: "ACCOUNTS",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "REACTIONS",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    USER_ID = table.Column<int>(type: "int", nullable: false),
                    TARGET_TYPE = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    TARGET_ID = table.Column<int>(type: "int", nullable: false),
                    REACTION_TYPE = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CREATED_AT = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_REACTIONS", x => x.ID);
                    table.ForeignKey(
                        name: "FK__REACTIONS__USER___114A936A",
                        column: x => x.USER_ID,
                        principalTable: "ACCOUNTS",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "SERVICE",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NAME = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    DESCRIPTION = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    PRICE = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    HOST_ID = table.Column<int>(type: "int", nullable: false),
                    CREATED_AT = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    UPDATED_AT = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SERVICE", x => x.ID);
                    table.ForeignKey(
                        name: "FK__SERVICE__HOST_ID__5441852A",
                        column: x => x.HOST_ID,
                        principalTable: "ACCOUNTS",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "SERVICECOMBO",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NAME = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    ADDRESS = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    DESCRIPTION = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    PRICE = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    AVAILABLE_SLOTS = table.Column<int>(type: "int", nullable: false),
                    IMAGE = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    STATUS = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true, defaultValueSql: "('open')"),
                    CANCELLATION_POLICY = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CREATED_AT = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    UPDATED_AT = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    HOST_ID = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SERVICECOMBO", x => x.ID);
                    table.ForeignKey(
                        name: "FK__SERVICECO__HOST___59FA5E80",
                        column: x => x.HOST_ID,
                        principalTable: "ACCOUNTS",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "COMMENTS",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    POST_ID = table.Column<int>(type: "int", nullable: false),
                    AUTHOR_ID = table.Column<int>(type: "int", nullable: false),
                    PARENT_COMMENT_ID = table.Column<int>(type: "int", nullable: true),
                    CONTENT = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CREATED_AT = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    Image = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_COMMENTS", x => x.ID);
                    table.ForeignKey(
                        name: "FK__COMMENTS__AUTHOR__0C85DE4D",
                        column: x => x.AUTHOR_ID,
                        principalTable: "ACCOUNTS",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK__COMMENTS__PARENT__0D7A0286",
                        column: x => x.PARENT_COMMENT_ID,
                        principalTable: "COMMENTS",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK__COMMENTS__POST_I__0B91BA14",
                        column: x => x.POST_ID,
                        principalTable: "POSTS",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "BOOKINGS",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    USER_ID = table.Column<int>(type: "int", nullable: false),
                    COMBO_ID = table.Column<int>(type: "int", nullable: false),
                    BOOKING_DATE = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    START_DATE = table.Column<DateTime>(type: "date", nullable: false),
                    END_DATE = table.Column<DateTime>(type: "date", nullable: false),
                    QUANTITY = table.Column<int>(type: "int", nullable: false),
                    TOTAL_AMOUNT = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    NOTES = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    STATUS = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true, defaultValueSql: "('pending')")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BOOKINGS", x => x.ID);
                    table.ForeignKey(
                        name: "FK__BOOKINGS__COMBO___6E01572D",
                        column: x => x.COMBO_ID,
                        principalTable: "SERVICECOMBO",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK__BOOKINGS__USER_I__6D0D32F4",
                        column: x => x.USER_ID,
                        principalTable: "ACCOUNTS",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "COUPONS",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CODE = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    DESCRIPTION = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    DISCOUNT_PERCENT = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    DISCOUNT_AMOUNT = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    USAGE_LIMIT = table.Column<int>(type: "int", nullable: false),
                    USAGE_COUNT = table.Column<int>(type: "int", nullable: true, defaultValueSql: "((0))"),
                    HOST_ID = table.Column<int>(type: "int", nullable: false),
                    SERVICECOMBO_ID = table.Column<int>(type: "int", nullable: false),
                    IS_ACTIVE = table.Column<bool>(type: "bit", nullable: true, defaultValueSql: "((1))"),
                    CREATED_AT = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    UPDATED_AT = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_COUPONS", x => x.ID);
                    table.ForeignKey(
                        name: "FK__COUPONS__HOST_ID__66603565",
                        column: x => x.HOST_ID,
                        principalTable: "ACCOUNTS",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK__COUPONS__SERVICE__6754599E",
                        column: x => x.SERVICECOMBO_ID,
                        principalTable: "SERVICECOMBO",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "REQUEST_SUPPORTS",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    USER_ID = table.Column<int>(type: "int", nullable: false),
                    COMBO_ID = table.Column<int>(type: "int", nullable: true),
                    SUPPORT_TYPE = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    CONTENT = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    IMAGE = table.Column<string>(type: "varchar(255)", unicode: false, maxLength: 255, nullable: true),
                    STATUS = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true, defaultValueSql: "('Pending')"),
                    CREATED_AT = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    UPDATED_AT = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_REQUEST_SUPPORTS", x => x.ID);
                    table.ForeignKey(
                        name: "FK__REQUEST_S__COMBO__1DB06A4F",
                        column: x => x.COMBO_ID,
                        principalTable: "SERVICECOMBO",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK__REQUEST_S__USER___1CBC4616",
                        column: x => x.USER_ID,
                        principalTable: "ACCOUNTS",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "REVIEWS",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    COMBO_ID = table.Column<int>(type: "int", nullable: false),
                    AUTHOR_ID = table.Column<int>(type: "int", nullable: false),
                    PARENT_REVIEW_ID = table.Column<int>(type: "int", nullable: true),
                    RATING = table.Column<int>(type: "int", nullable: true),
                    CONTENT = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CREATED_AT = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_REVIEWS", x => x.ID);
                    table.ForeignKey(
                        name: "FK__REVIEWS__AUTHOR___7D439ABD",
                        column: x => x.AUTHOR_ID,
                        principalTable: "ACCOUNTS",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK__REVIEWS__COMBO_I__7C4F7684",
                        column: x => x.COMBO_ID,
                        principalTable: "SERVICECOMBO",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK__REVIEWS__PARENT___7E37BEF6",
                        column: x => x.PARENT_REVIEW_ID,
                        principalTable: "REVIEWS",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "SERVICECOMBO_DETAIL",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SERVICECOMBO_ID = table.Column<int>(type: "int", nullable: false),
                    SERVICE_ID = table.Column<int>(type: "int", nullable: false),
                    QUANTITY = table.Column<int>(type: "int", nullable: true, defaultValueSql: "((1))")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SERVICECOMBO_DETAIL", x => x.ID);
                    table.ForeignKey(
                        name: "FK__SERVICECO__SERVI__5DCAEF64",
                        column: x => x.SERVICECOMBO_ID,
                        principalTable: "SERVICECOMBO",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK__SERVICECO__SERVI__5EBF139D",
                        column: x => x.SERVICE_ID,
                        principalTable: "SERVICE",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "PAYMENTS",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BOOKING_ID = table.Column<int>(type: "int", nullable: false),
                    AMOUNT = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PAYMENT_DATE = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    METHOD = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    STATUS = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true, defaultValueSql: "('pending')")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PAYMENTS", x => x.ID);
                    table.ForeignKey(
                        name: "FK__PAYMENTS__BOOKIN__787EE5A0",
                        column: x => x.BOOKING_ID,
                        principalTable: "BOOKINGS",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "BOOKING_COUPONS",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BOOKING_ID = table.Column<int>(type: "int", nullable: false),
                    COUPON_ID = table.Column<int>(type: "int", nullable: false),
                    APPLIED_AT = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BOOKING_COUPONS", x => x.ID);
                    table.ForeignKey(
                        name: "FK__BOOKING_C__BOOKI__72C60C4A",
                        column: x => x.BOOKING_ID,
                        principalTable: "BOOKINGS",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK__BOOKING_C__COUPO__73BA3083",
                        column: x => x.COUPON_ID,
                        principalTable: "COUPONS",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "SUPPORT_RESPONSES",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SUPPORT_ID = table.Column<int>(type: "int", nullable: false),
                    RESPONDER_ID = table.Column<int>(type: "int", nullable: false),
                    CONTENT = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    IMAGE = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    CREATED_AT = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SUPPORT_RESPONSES", x => x.ID);
                    table.ForeignKey(
                        name: "FK__SUPPORT_R__RESPO__22751F6C",
                        column: x => x.RESPONDER_ID,
                        principalTable: "ACCOUNTS",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK__SUPPORT_R__SUPPO__2180FB33",
                        column: x => x.SUPPORT_ID,
                        principalTable: "REQUEST_SUPPORTS",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateIndex(
                name: "IX_ACCOUNTS_ROLE_ID",
                table: "ACCOUNTS",
                column: "ROLE_ID");

            migrationBuilder.CreateIndex(
                name: "UQ__ACCOUNTS__161CF724AB7CCC50",
                table: "ACCOUNTS",
                column: "EMAIL",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AGENCIE_CERTIFICATES_AccountId",
                table: "AGENCIE_CERTIFICATES",
                column: "AccountId");

            migrationBuilder.CreateIndex(
                name: "IX_BOOKING_COUPONS_COUPON_ID",
                table: "BOOKING_COUPONS",
                column: "COUPON_ID");

            migrationBuilder.CreateIndex(
                name: "UQ_BookingPromotion",
                table: "BOOKING_COUPONS",
                columns: new[] { "BOOKING_ID", "COUPON_ID" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BOOKINGS_COMBO_ID",
                table: "BOOKINGS",
                column: "COMBO_ID");

            migrationBuilder.CreateIndex(
                name: "IX_BOOKINGS_USER_ID",
                table: "BOOKINGS",
                column: "USER_ID");

            migrationBuilder.CreateIndex(
                name: "IX_COMMENTS_AUTHOR_ID",
                table: "COMMENTS",
                column: "AUTHOR_ID");

            migrationBuilder.CreateIndex(
                name: "IX_COMMENTS_PARENT_COMMENT_ID",
                table: "COMMENTS",
                column: "PARENT_COMMENT_ID");

            migrationBuilder.CreateIndex(
                name: "IX_COMMENTS_POST_ID",
                table: "COMMENTS",
                column: "POST_ID");

            migrationBuilder.CreateIndex(
                name: "IX_COUPONS_HOST_ID",
                table: "COUPONS",
                column: "HOST_ID");

            migrationBuilder.CreateIndex(
                name: "IX_COUPONS_SERVICECOMBO_ID",
                table: "COUPONS",
                column: "SERVICECOMBO_ID");

            migrationBuilder.CreateIndex(
                name: "UQ__COUPONS__AA1D4379DAE87058",
                table: "COUPONS",
                column: "CODE",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_HOST_CERTIFICATES_HostId",
                table: "HOST_CERTIFICATES",
                column: "HostId");

            migrationBuilder.CreateIndex(
                name: "IX_MESSAGES_RECEIVER_ID",
                table: "MESSAGES",
                column: "RECEIVER_ID");

            migrationBuilder.CreateIndex(
                name: "IX_MESSAGES_SENDER_ID",
                table: "MESSAGES",
                column: "SENDER_ID");

            migrationBuilder.CreateIndex(
                name: "IX_NEWS_AccountId",
                table: "NEWS",
                column: "AccountId");

            migrationBuilder.CreateIndex(
                name: "IX_NOTIFICATIONS_USER_ID",
                table: "NOTIFICATIONS",
                column: "USER_ID");

            migrationBuilder.CreateIndex(
                name: "IX_OTP_USER_ID",
                table: "OTP",
                column: "USER_ID");

            migrationBuilder.CreateIndex(
                name: "IX_PAYMENTS_BOOKING_ID",
                table: "PAYMENTS",
                column: "BOOKING_ID");

            migrationBuilder.CreateIndex(
                name: "IX_POSTS_AUTHOR_ID",
                table: "POSTS",
                column: "AUTHOR_ID");

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
                name: "IX_REVIEWS_AUTHOR_ID",
                table: "REVIEWS",
                column: "AUTHOR_ID");

            migrationBuilder.CreateIndex(
                name: "IX_REVIEWS_COMBO_ID",
                table: "REVIEWS",
                column: "COMBO_ID");

            migrationBuilder.CreateIndex(
                name: "IX_REVIEWS_PARENT_REVIEW_ID",
                table: "REVIEWS",
                column: "PARENT_REVIEW_ID");

            migrationBuilder.CreateIndex(
                name: "UQ__ROLES__D9C1FA008ED1E6F8",
                table: "ROLES",
                column: "NAME",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SERVICE_HOST_ID",
                table: "SERVICE",
                column: "HOST_ID");

            migrationBuilder.CreateIndex(
                name: "IX_SERVICECOMBO_HOST_ID",
                table: "SERVICECOMBO",
                column: "HOST_ID");

            migrationBuilder.CreateIndex(
                name: "IX_SERVICECOMBO_DETAIL_SERVICE_ID",
                table: "SERVICECOMBO_DETAIL",
                column: "SERVICE_ID");

            migrationBuilder.CreateIndex(
                name: "IX_SERVICECOMBO_DETAIL_SERVICECOMBO_ID",
                table: "SERVICECOMBO_DETAIL",
                column: "SERVICECOMBO_ID");

            migrationBuilder.CreateIndex(
                name: "IX_SUPPORT_RESPONSES_RESPONDER_ID",
                table: "SUPPORT_RESPONSES",
                column: "RESPONDER_ID");

            migrationBuilder.CreateIndex(
                name: "IX_SUPPORT_RESPONSES_SUPPORT_ID",
                table: "SUPPORT_RESPONSES",
                column: "SUPPORT_ID");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AGENCIE_CERTIFICATES");

            migrationBuilder.DropTable(
                name: "BOOKING_COUPONS");

            migrationBuilder.DropTable(
                name: "COMMENTS");

            migrationBuilder.DropTable(
                name: "HOST_CERTIFICATES");

            migrationBuilder.DropTable(
                name: "MESSAGES");

            migrationBuilder.DropTable(
                name: "NEWS");

            migrationBuilder.DropTable(
                name: "NOTIFICATIONS");

            migrationBuilder.DropTable(
                name: "OTP");

            migrationBuilder.DropTable(
                name: "PAYMENTS");

            migrationBuilder.DropTable(
                name: "REACTIONS");

            migrationBuilder.DropTable(
                name: "REVIEWS");

            migrationBuilder.DropTable(
                name: "SERVICECOMBO_DETAIL");

            migrationBuilder.DropTable(
                name: "SUPPORT_RESPONSES");

            migrationBuilder.DropTable(
                name: "SYSTEM_LOGS");

            migrationBuilder.DropTable(
                name: "COUPONS");

            migrationBuilder.DropTable(
                name: "POSTS");

            migrationBuilder.DropTable(
                name: "BOOKINGS");

            migrationBuilder.DropTable(
                name: "SERVICE");

            migrationBuilder.DropTable(
                name: "REQUEST_SUPPORTS");

            migrationBuilder.DropTable(
                name: "SERVICECOMBO");

            migrationBuilder.DropTable(
                name: "ACCOUNTS");

            migrationBuilder.DropTable(
                name: "ROLES");
        }
    }
}
