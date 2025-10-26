using System.Text;
using System.Text.Json.Serialization;
using HealthTrack.Application.Services;
using HealthTrack.Infrastructure.Data;
using HealthTrack.Infrastructure.Features;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// ========================================
// 📋 Configuration Extraction
// ========================================

var connectionString = builder.Configuration.GetConnectionString("Default")
                       ?? Environment.GetEnvironmentVariable("ConnectionStrings__Default");
if (string.IsNullOrWhiteSpace(connectionString))
    throw new InvalidOperationException("Missing connection string 'Default'");

var awsServiceUrl = builder.Configuration["AWS:ServiceURL"] ?? Environment.GetEnvironmentVariable("AWS__ServiceURL");
var featureFlagsFallbackPath = builder.Configuration["FeatureFlags:FallbackPath"];

var jwtSecret = builder.Configuration["Jwt:Secret"] ?? Environment.GetEnvironmentVariable("JWT__SECRET") ?? "super-secret-jwt-key-for-healthtrack-that-should-be-changed-in-production";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "HealthTrack";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "HealthTrack";

// ========================================
// 🎛️ Service Registration
// ========================================

// CORS Configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000") // React dev servers
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// Controllers & JSON Configuration
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.DictionaryKeyPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

// Database
builder.Services.AddDbContext<HealthTrackDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

// Feature Flags
var featureFlagProvider = DynamoFeatureFlagProvider.Create(awsServiceUrl);
builder.Services.AddSingleton<IFeatureFlagService>(new FeatureFlagService(featureFlagProvider, featureFlagsFallbackPath));

// Application Services
builder.Services.AddScoped<AppointmentService>();
builder.Services.AddScoped<IAuthService, AuthService>();

// JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(jwtSecret)),
            ClockSkew = TimeSpan.Zero // Removes the default 5-minute tolerance
        };
    });

builder.Services.AddAuthorization();

// ========================================
// 🚀 Application Building & Configuration
// ========================================

var app = builder.Build();

// Database Initialization (Development/Local)
using (var scope = app.Services.CreateScope())
{
  var dbContext = scope.ServiceProvider.GetRequiredService<HealthTrackDbContext>();

  // Development: keep data between restarts
  dbContext.Database.EnsureCreated();

  // If you use EF Migrations, prefer this instead:
  // dbContext.Database.Migrate();
}

// Middleware Pipeline
app.UseCors("AllowFrontend");  // 🌐 Enable CORS before routing
app.UseAuthentication();       // 🔐 JWT Authentication middleware
app.UseAuthorization();        // 🛡️ Authorization middleware
app.MapControllers();

app.Run();
