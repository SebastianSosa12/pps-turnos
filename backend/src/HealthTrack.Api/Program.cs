using System.Text;
using System.Text.Json.Serialization;
using HealthTrack.Application.Services;
using HealthTrack.Infrastructure.Data;
using HealthTrack.Infrastructure.Features;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

string? connectionString =
    builder.Configuration.GetConnectionString("Default") ??
    builder.Configuration["ConnectionStrings:Default"] ??
    Environment.GetEnvironmentVariable("ConnectionStrings__Default");

if (string.IsNullOrWhiteSpace(connectionString))
    throw new InvalidOperationException("Missing connection string 'Default'");

string? awsServiceUrl =
    builder.Configuration["AWS:ServiceURL"] ??
    Environment.GetEnvironmentVariable("AWS__ServiceURL");

string? featureFlagsFallbackPath = builder.Configuration["FeatureFlags:FallbackPath"];

string jwtKey =
    builder.Configuration["JWT:Key"] ??
    builder.Configuration["Jwt:Secret"] ??
    Environment.GetEnvironmentVariable("JWT__KEY") ??
    Environment.GetEnvironmentVariable("JWT__SECRET") ??
    "change-this-default-healthtrack-jwt-key";

string jwtIssuer =
    builder.Configuration["JWT:Issuer"] ??
    builder.Configuration["Jwt:Issuer"] ??
    Environment.GetEnvironmentVariable("JWT__ISSUER") ??
    "HealthTrack";

string jwtAudience =
    builder.Configuration["JWT:Audience"] ??
    builder.Configuration["Jwt:Audience"] ??
    Environment.GetEnvironmentVariable("JWT__AUDIENCE") ??
    "HealthTrack";

builder.Services.AddCors(options =>
{
  options.AddPolicy("AllowFrontend", policy =>
  {
    policy
      .WithOrigins(
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000"
      )
      .AllowAnyHeader()
      .AllowAnyMethod()
      .AllowCredentials();
  });
});


builder.Services
    .AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.DictionaryKeyPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

var serverVersion = new MySqlServerVersion(new Version(8, 0, 36));
builder.Services.AddDbContext<HealthTrackDbContext>(options =>
  options.UseMySql(connectionString, serverVersion, mySql =>
  {
    mySql.EnableRetryOnFailure();
  }));

var featureFlagProvider = DynamoFeatureFlagProvider.Create(awsServiceUrl);
builder.Services.AddSingleton<IFeatureFlagService>(new FeatureFlagService(featureFlagProvider, featureFlagsFallbackPath));

builder.Services.AddScoped<AppointmentService>();
builder.Services.AddScoped<IAuthService, AuthService>();

builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
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
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.FallbackPolicy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();
    options.AddPolicy("AdminOnly", p => p.RequireRole("Admin"));
    options.AddPolicy("ReadOnlyUser", p => p.RequireRole("User", "Admin"));
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
  var dbContext = scope.ServiceProvider.GetRequiredService<HealthTrackDbContext>();
  dbContext.Database.EnsureCreated();
}


app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
