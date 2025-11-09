using ESCE_SYSTEM.Helper; // Namespace cho JwtHelper, EmailHelper, SMSHelper, OTPGenerator
using ESCE_SYSTEM.Options; // Namespace cho JwtSetting, EmailConfig
using ESCE_SYSTEM.Services.RoleService;
using ESCE_SYSTEM.Services.UserService;
using ESCE_SYSTEM.Repositories.RoleRepository;
using ESCE_SYSTEM.Repositories.UserRepository;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using ESCE_SYSTEM.Models;
using ESCE_SYSTEM.Helpers;
using ESCE_SYSTEM.Services.UserContextService;
using ESCE_SYSTEM.Repositories.OtpRepository;
using ESCE_SYSTEM.Services.NotificationService;
using ESCE_SYSTEM.Repositories.NotificationRepository;
using ESCE_SYSTEM.Repositories.MessageRepository;
using ESCE_SYSTEM.Services.MessageService;
using ESCE_SYSTEM.SignalR;
using ESCE_SYSTEM.SeedData;
using ESCE_SYSTEM.Services;
using ESCE_SYSTEM.Repositories;
using ESCE_SYSTEM.Services.PostService;
using ESCE_SYSTEM.Repositories.PostRepository;
using ESCE_SYSTEM.Repositories.PostCommentRepository;


var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddSignalR();
// Configure DbContext with SQL Server
builder.Services.AddDbContext<ESCEContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection") ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found."),
        sqlServerOptions => sqlServerOptions.CommandTimeout(120))); // Increase command timeout to 120 seconds

// Đăng ký các dịch vụ và repository
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
builder.Services.AddScoped<IServiceComboService, ServiceComboService>();
builder.Services.AddScoped<IServiceComboRepository, ServiceComboRepository>();
builder.Services.AddScoped<IServiceComboDetailService, ServiceComboDetailService>();
builder.Services.AddScoped<IServiceComboDetailRepository, ServiceComboDetailRepository>();
builder.Services.AddScoped<IServiceService, ServiceService>();
builder.Services.AddScoped<IServiceRepository, ServiceRepository>();
builder.Services.AddScoped<ICouponService, CouponService>();
builder.Services.AddScoped<ICouponRepository, CouponRepository>();
builder.Services.AddScoped<IBookingRepository, BookingRepository>();
builder.Services.AddScoped<IReviewRepository, ReviewRepository>();
builder.Services.AddScoped<IPostService, PostService>();
builder.Services.AddScoped<IPostRepository, PostRepository>();
builder.Services.AddScoped<IPostCommentRepository, PostCommentRepository>();

// Đăng ký các helper
builder.Services.AddScoped<JwtHelper>();   // đổi Singleton -> Scoped
builder.Services.AddSingleton<EmailHelper>();
/*builder.Services.AddSingleton<SMSHelper>();*/
builder.Services.AddSingleton<OTPGenerator>();

// Cấu hình JwtSetting và EmailConfig từ appsettings.json
builder.Services.Configure<JwtSetting>(builder.Configuration.GetSection("Jwt"));
/*builder.Services.Configure<EmailConfig>(builder.Configuration.GetSection("Email"));*/
builder.Services.Configure<SmtpSetting>(builder.Configuration.GetSection("Email"));

// Cấu hình Authentication với JWT
//builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
//.AddJwtBearer(options =>
//{
//    var jwtSettings = builder.Configuration.GetSection("Jwt").Get<JwtSetting>();
//    options.TokenValidationParameters = new TokenValidationParameters
//    {
//        ValidateIssuer = true,
//        ValidateAudience = true,
//        ValidateLifetime = true,
//        ValidateIssuerSigningKey = true,
//        ValidIssuer = jwtSettings.Issuer,
//        ValidAudience = jwtSettings.Audience,
//        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Key))
//    };
//});


builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var jwtSettings = builder.Configuration.GetSection("Jwt").Get<JwtSetting>() ?? throw new InvalidOperationException("JWT settings not found.");
        var key = Encoding.UTF8.GetBytes(jwtSettings.Key);
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = false,
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
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles; // Ignore circular references
        options.JsonSerializerOptions.MaxDepth = 32; // Set max depth to prevent infinite loops
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

//Default data
using (var scope = app.Services.CreateScope())
{
    var userService = scope.ServiceProvider.GetRequiredService<IUserService>();

    var roleService = scope.ServiceProvider.GetRequiredService<IRoleService>();
    var roleRepository = scope.ServiceProvider.GetRequiredService<IRoleRepository>();
    var userRepository = scope.ServiceProvider.GetRequiredService<IUserRepository>();
    await SeedData.Initialize(userService, roleService, roleRepository, userRepository);
}


// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Request logging middleware
app.Use(async (context, next) =>
{
    if (context.Request.Path.StartsWithSegments("/api/Post"))
    {
        Console.WriteLine($"{context.Request.Method} request received: {context.Request.Path}");
        Console.WriteLine($"Query string: {context.Request.QueryString}");
    }
    await next();
});

// Sử dụng CORS (nếu cần)
app.UseCors("AllowAll");

// Sử dụng Authentication trước Authorization
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// 🟢 MAP CÁC SIGNALR HUBS
app.MapHub<NotificationHub>("/hubs/notification");
app.MapHub<ChatHub>("/hubs/chat");

app.Run();
