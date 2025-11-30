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

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddSignalR();
// Configure DbContext with SQL Server
builder.Services.AddDbContext<ESCEContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

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
    var services = scope.ServiceProvider;
    var config = services.GetRequiredService<IConfiguration>();
    var db = services.GetRequiredService<ESCEContext>();

    var seedDemo = config.GetValue<bool>("Demo:SeedDemoAccounts");
    if (seedDemo)
    {
        db.Database.Migrate();

        // Ensure roles
        string[] roleNames = new[] { "Tourist", "Host", "Agency" };
        foreach (var roleName in roleNames)
        {
            if (!db.Roles.Any(r => r.Name == roleName))
            {
                db.Roles.Add(new Role { Name = roleName, Description = $"{roleName} role" });
            }
        }
        db.SaveChanges();

        var touristRole = db.Roles.First(r => r.Name == "Tourist");
        var hostRole = db.Roles.First(r => r.Name == "Host");
        var agencyRole = db.Roles.First(r => r.Name == "Agency");

        // Demo users
        var demoPassword = config.GetValue<string>("Demo:DemoPassword") ?? "123456";
        var hostEmail = config.GetValue<string>("Demo:HostEmail") ?? "host@demo.local";
        var agencyEmail = config.GetValue<string>("Demo:AgencyEmail") ?? "agency@demo.local";
        var touristEmail = config.GetValue<string>("Demo:TouristEmail") ?? "tourist@demo.local";

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

app.UseHttpsRedirection();

// Enable static files serving
app.UseStaticFiles();

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Redirect root to index.html
app.MapGet("/", context =>
{
    context.Response.Redirect("/index.html");
    return Task.CompletedTask;
});

app.Run();
