using ESCE_SYSTEM.Helper; // Namespace cho JwtHelper, EmailHelper, SMSHelper, OTPGenerator
using ESCE_SYSTEM.Helpers;
using ESCE_SYSTEM.Models;
using ESCE_SYSTEM.Options; // Namespace cho JwtSetting, EmailConfig
using ESCE_SYSTEM.Repositories;
using ESCE_SYSTEM.Repositories.MessageRepository;
using ESCE_SYSTEM.Repositories.NotificationRepository;
using ESCE_SYSTEM.Repositories.OtpRepository;
using ESCE_SYSTEM.Repositories.RoleRepository;
using ESCE_SYSTEM.Repositories.UserRepository;
using ESCE_SYSTEM.SeedData; // Đã thêm: Namespace cho class SeedData
using ESCE_SYSTEM.Services;
using ESCE_SYSTEM.Services.MessageService;
using ESCE_SYSTEM.Services.NotificationService;
using ESCE_SYSTEM.Services.PaymentService;
using ESCE_SYSTEM.Services.RoleService;
using ESCE_SYSTEM.Services.StatisticsService;
using ESCE_SYSTEM.Services.UserContextService;
using ESCE_SYSTEM.Services.UserService;
using ESCE_SYSTEM.SignalR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Threading.Tasks;

var builder = WebApplication.CreateBuilder(args);

// Dòng 29: Khai báo biến useInMemoryDb (Giả định giá trị được lấy từ cấu hình)
bool useInMemoryDb = builder.Configuration.GetValue<bool>("Demo:UseInMemoryDb");

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddSignalR();

// Configure DbContext with SQL Server
builder.Services.AddDbContext<ESCEContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// ====================================================================
// KHẮC PHỤC LỖI DEPENDENCY INJECTION (DI)
// Cần đăng ký Interface và Implementation cho các Repository
// ====================================================================

// --- 1. Đăng ký CÁC REPOSITORY BỊ THIẾU (Nguyên nhân gây ra System.AggregateException) ---

// Booking
builder.Services.AddScoped<IBookingRepository, BookingRepository>();
// Comment & Reaction
builder.Services.AddScoped<ICommentReactionRepository, CommentReactionRepository>();
builder.Services.AddScoped<ICommentRepository, CommentRepository>();
// Coupon
builder.Services.AddScoped<ICouponRepository, CouponRepository>();
// Post & Reaction & Save
builder.Services.AddScoped<IPostReactionRepository, PostReactionRepository>();
builder.Services.AddScoped<IPostSaveRepository, PostSaveRepository>();
builder.Services.AddScoped<IPostRepository, PostRepository>();
// Review
builder.Services.AddScoped<IReviewRepository, ReviewRepository>();
// Service Combo
builder.Services.AddScoped<IServiceComboDetailRepository, ServiceComboDetailRepository>();
builder.Services.AddScoped<IServiceComboRepository, ServiceComboRepository>();
builder.Services.AddScoped<IServiceRepository, ServiceRepository>();
// System Log
builder.Services.AddScoped<ISystemLogRepository, SystemLogRepository>();

// --- 2. Đăng ký SERVICES và REPOSITORIES ĐÃ TỒN TẠI (Đã kiểm tra lại) ---

// Đăng ký Service/Implementation (Giữ nguyên cấu hình cũ)
builder.Services.AddScoped<IBookingService, BookingService>();
builder.Services.AddScoped<ICommentReactionService, CommentReactionService>();
builder.Services.AddScoped<ICommentService, CommentService>();
builder.Services.AddScoped<ICouponService, CouponService>();
builder.Services.AddScoped<IPostReactionService, PostReactionService>();
builder.Services.AddScoped<IPostSaveService, PostSaveService>();
builder.Services.AddScoped<IPostService, PostService>();
builder.Services.AddScoped<IReviewService, ReviewService>();
builder.Services.AddScoped<IServiceComboDetailService, ServiceComboDetailService>();
builder.Services.AddScoped<IServiceComboService, ServiceComboService>();
builder.Services.AddScoped<IServiceService, ServiceService>();
builder.Services.AddScoped<IStatisticsService, StatisticsService>();
builder.Services.AddScoped<ISystemLogService, SystemLogService>();

// Các Repository khác (chỉ có Implementation - cần sửa lại thành Interface)
// LƯU Ý: Những dòng dưới đây CHỈ đăng ký lớp cụ thể, không cần thiết trừ khi bạn cần inject lớp cụ thể.
// Tuy nhiên, trong .NET Core, bạn nên dùng Interface: AddScoped<IInterface, Implementation>()

// *** Dòng cũ của bạn (CHỈ đăng ký Implementation, thường không khuyến nghị) ***
// builder.Services.AddScoped<BookingRepository, BookingRepository>();
// builder.Services.AddScoped<CommentReactionRepository, CommentReactionRepository>();
// ... và các dòng tương tự
// Nếu các Repository này đã có file Interface tương ứng, bạn nên XÓA các dòng cũ này
// và CHỈ dùng các dòng AddScoped<IInterface, Implementation> ở phía trên.

// Các Service và Repository đã được đăng ký đúng Interface/Implementation:
builder.Services.AddScoped<IRoleService, RoleService>();
builder.Services.AddScoped<IRoleRepository, RoleRepository>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<NotificationRepository, NotificationRepository>();
builder.Services.AddScoped<IMessageService, MessageService>();
builder.Services.AddScoped<MessageRepository, MessageRepository>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IUserContextService, UserContextService>();
builder.Services.AddScoped<IOtpRepository, OtpRepository>();
builder.Services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();

// Đăng ký các helper
builder.Services.AddScoped<JwtHelper>();
builder.Services.AddSingleton<EmailHelper>();
/*builder.Services.AddSingleton<SMSHelper>();*/
builder.Services.AddSingleton<OTPGenerator>();

// Cấu hình JwtSetting và EmailConfig từ appsettings.json
builder.Services.Configure<JwtSetting>(builder.Configuration.GetSection("Jwt"));
/*builder.Services.Configure<EmailConfig>(builder.Configuration.GetSection("Email"));*/
builder.Services.Configure<SmtpSetting>(builder.Configuration.GetSection("Email"));

// Cấu hình Authentication với JWT
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var jwtSettings = builder.Configuration.GetSection("Jwt").Get<JwtSetting>();
        // Kiểm tra null cho Key
        if (string.IsNullOrEmpty(jwtSettings?.Key))
        {
            throw new InvalidOperationException("Jwt:Key is not configured properly in appsettings.json");
        }

        var key = Encoding.UTF8.GetBytes(jwtSettings.Key);
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true, // Đã đổi thành true vì bạn cung cấp Key
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidIssuer = jwtSettings.Issuer,
            ValidAudience = jwtSettings.Audience
        };
    });


builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = null; // giữ nguyên PascalCase
    });

// (Tùy chọn) Cấu hình CORS nếu API được gọi từ frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddAuthorization();

// Swagger với hỗ trợ JWT Bearer
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "ESCE API",
        Version = "v1"
    });

    // Thêm nút Authorize
    options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Nhập JWT token theo dạng: Bearer {your token}"
    });

    options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    // KHẮC PHỤC LỖI CS1061: Tạo scope để truy cập services
    using (var scope = app.Services.CreateScope())
    {
        var services = scope.ServiceProvider;
        var config = services.GetRequiredService<IConfiguration>();
        var db = services.GetRequiredService<ESCEContext>();

        var seedDemo = config.GetValue<bool>("Demo:SeedDemoAccounts");

        // 1. KHẮC PHỤC LỖI: Xóa db.Database.Migrate() tại đây để tránh lỗi 'already an object named Roles'
        //    Bởi vì việc chạy Migrate() tự động trong code có thể gây lỗi trùng lặp nếu database đã tồn tại.
        //    KHUYẾN NGHỊ: Chạy migration bằng lệnh 'dotnet ef database update' thủ công.
        // db.Database.Migrate(); // <--- DÒNG NÀY ĐÃ BỊ XÓA HOẶC COMMENT

        if (seedDemo)
        {
            // 2. Lấy các services/repositories cần thiết cho SeedData.Initialize
            var userService = services.GetRequiredService<IUserService>();
            var roleService = services.GetRequiredService<IRoleService>();
            var roleRepository = services.GetRequiredService<IRoleRepository>();
            var userRepository = services.GetRequiredService<IUserRepository>();

            // 3. GỌI HÀM SEED DATA CỦA BẠN (Dùng .Wait() để đồng bộ hóa)
            // Khối này sẽ tạo 4 Roles và Admin Account nếu chưa tồn tại.
            SeedData.Initialize(userService, roleService, roleRepository, userRepository).Wait();
        }
    }

    // Enable Swagger
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Enable static files serving (Dùng cho cả Development và Production)
app.UseStaticFiles();

app.UseHttpsRedirection();

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapGet("/", () => Results.Redirect("/swagger")).ExcludeFromDescription();
app.MapFallbackToFile("index.html");

app.Run();