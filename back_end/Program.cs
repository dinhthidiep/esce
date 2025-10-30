using ESCE_SYSTEM.Helper; // Namespace cho JwtHelper, EmailHelper, SMSHelper, OTPGenerator
using ESCE_SYSTEM.Options; // Namespace cho JwtSetting, EmailConfig
// Removed Role/User services from scope
using ESCE_SYSTEM.Repositories;
using ESCE_SYSTEM.Services;
using ESCE_SYSTEM.Services.PaymentService;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using ESCE_SYSTEM.Models;
using ESCE_SYSTEM.Helpers;
using System.Text.Json.Serialization;
// Removed UserContext and Otp namespaces

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Configure DbContext: use InMemory in Development, or when USE_INMEMORY_DB=1
var useInMemoryDb = builder.Environment.IsDevelopment() || Environment.GetEnvironmentVariable("USE_INMEMORY_DB") == "1";
builder.Services.AddDbContext<ESCEContext>(options =>
{
    if (useInMemoryDb)
    {
        options.UseInMemoryDatabase("ESCE_Test");
    }
    else
    {
        options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
    }
});

// Đăng ký các dịch vụ và repository (trimmed to required domains)
builder.Services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();

builder.Services.AddScoped<IServiceRepository, ServiceRepository>();
builder.Services.AddScoped<IServiceService, ServiceService>();

builder.Services.AddScoped<IServiceComboRepository, ServiceComboRepository>();
builder.Services.AddScoped<IServiceComboService, ServiceComboService>();

builder.Services.AddScoped<IServiceComboDetailRepository, ServiceComboDetailRepository>();
builder.Services.AddScoped<IServiceComboDetailService, ServiceComboDetailService>();

builder.Services.AddScoped<IBookingRepository, BookingRepository>();
builder.Services.AddScoped<IBookingService, BookingService>();

builder.Services.AddScoped<ICouponRepository, CouponRepository>();
builder.Services.AddScoped<ICouponService, CouponService>();

// Đăng ký Booking và Review
builder.Services.AddScoped<BookingRepository>();
builder.Services.AddScoped<BookingService>();
builder.Services.AddScoped<ReviewRepository>();
builder.Services.AddScoped<ReviewService>();
// Repository
builder.Services.AddScoped<IReviewRepository, ReviewRepository>();
builder.Services.AddScoped<INewsRepository, NewsRepository>();

// Register missing service interfaces
builder.Services.AddScoped<IReviewService, ReviewService>();
builder.Services.AddScoped<INewsService, NewsService>();

// Đăng ký News
builder.Services.AddScoped<NewsRepository>();
builder.Services.AddScoped<NewsService>();

// Đăng ký các helper
builder.Services.AddScoped<JwtHelper>();   // đổi Singleton -> Scoped
builder.Services.AddSingleton<EmailHelper>();
/*builder.Services.AddSingleton<SMSHelper>();*/
builder.Services.AddSingleton<OTPGenerator>();

// Cấu hình JwtSetting và EmailConfig từ appsettings.json
builder.Services.Configure<JwtSetting>(builder.Configuration.GetSection("Jwt"));
/*builder.Services.Configure<EmailConfig>(builder.Configuration.GetSection("Email"));*/
builder.Services.Configure<SmtpSetting>(builder.Configuration.GetSection("Email"));
builder.Services.Configure<PayOSOptions>(builder.Configuration.GetSection("PayOS"));
builder.Services.AddHttpClient<IPaymentService, PayOSPaymentService>();

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
        var jwtSettings = builder.Configuration.GetSection("Jwt").Get<JwtSetting>();
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
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
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
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Sử dụng CORS (nếu cần)
app.UseCors("AllowAll");

// Sử dụng Authentication trước Authorization
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Seed minimal data when using in-memory DB
if (useInMemoryDb)
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<ESCEContext>();
    db.Database.EnsureCreated();

    if (!db.Roles.Any())
    {
        db.Roles.Add(new Role { Name = "user" });
        db.SaveChanges();
    }

    if (!db.Accounts.Any())
    {
        var roleId = db.Roles.Select(r => r.Id).First();
        db.Accounts.Add(new Account
        {
            Name = "Test User",
            Email = "test@example.com",
            PasswordHash = "x",
            RoleId = roleId,
            CreatedAt = DateTime.UtcNow
        });
        db.SaveChanges();
    }

    var userId = db.Accounts.Select(a => a.Id).First();

    if (!db.Services.Any())
    {
        db.Services.Add(new Service
        {
            Name = "Test Service",
            Description = "Sample service",
            Price = 100000,
            HostId = userId
        });
        db.SaveChanges();
    }

    if (!db.ServiceCombos.Any())
    {
        db.ServiceCombos.Add(new ServiceCombo
        {
            Name = "Test Combo",
            Address = "123 Test St",
            Description = "Sample combo",
            Price = 200000,
            AvailableSlots = 10,
            HostId = userId,
            Status = "open"
        });
        db.SaveChanges();
    }

    if (!db.Bookings.Any())
    {
        var serviceId = db.Services.Select(s => s.Id).First();
        db.Bookings.Add(new Booking
        {
            UserId = userId,
            ServiceId = serviceId,
            Quantity = 2,
            UnitPrice = 100000,
            TotalAmount = 200000,
            ItemType = "service",
            BookingNumber = "SEED1",
            Status = "pending",
            Notes = "seed"
        });
        db.SaveChanges();
    }
}

app.Run();
