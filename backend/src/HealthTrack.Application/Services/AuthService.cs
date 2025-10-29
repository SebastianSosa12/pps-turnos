using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using HealthTrack.Domain.Dtos;
using HealthTrack.Domain.Entities;
using HealthTrack.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace HealthTrack.Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly HealthTrackDbContext dbContext;
        private readonly string jwtKey;
        private readonly string jwtIssuer;
        private readonly string jwtAudience;

        public AuthService(HealthTrackDbContext db, IConfiguration configuration)
        {
            dbContext = db;

            jwtKey =
                configuration["JWT:Key"] ??
                configuration["Jwt:Secret"] ??
                Environment.GetEnvironmentVariable("JWT__KEY") ??
                Environment.GetEnvironmentVariable("JWT__SECRET") ??
                throw new InvalidOperationException("JWT key not configured");

            jwtIssuer =
                configuration["JWT:Issuer"] ??
                configuration["Jwt:Issuer"] ??
                Environment.GetEnvironmentVariable("JWT__ISSUER") ??
                "HealthTrack";

            jwtAudience =
                configuration["JWT:Audience"] ??
                configuration["Jwt:Audience"] ??
                Environment.GetEnvironmentVariable("JWT__AUDIENCE") ??
                "HealthTrack";
        }

        public async Task<AuthResponse?> AuthenticateAsync(LoginRequest request, CancellationToken ct = default)
        {
            var username = request.Username?.Trim();
            if (string.IsNullOrEmpty(username)) return null;

            var user = await dbContext.Users
                .AsNoTracking()
                .Where(u => u.IsActive && u.Username == username)
                .FirstOrDefaultAsync(ct);

            if (user == null) return null;
            if (!VerifyPassword(request.Password, user.PasswordHash)) return null;

            var tracked = await dbContext.Users.FirstAsync(u => u.Id == user.Id, ct);
            tracked.LastLoginUtc = DateTime.UtcNow;
            await dbContext.SaveChangesAsync(ct);

            var expiresAt = DateTime.UtcNow.AddMinutes(15);
            var token = GenerateJwtToken(user, expiresAt);

            return new AuthResponse
            {
                Token = token,
                ExpiresAt = expiresAt,
                Username = user.Username,
                Role = user.Role.ToString()
            };
        }

        public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken ct = default)
        {
            var username = request.Username?.Trim();
            var email = request.Email?.Trim();

            if (string.IsNullOrWhiteSpace(username))
                throw new InvalidOperationException("Username is required");

            if (string.IsNullOrWhiteSpace(email))
                throw new InvalidOperationException("Email is required");

            var desiredRole = (request.Role ?? string.Empty).Trim();
            var role = string.Equals(desiredRole, "Admin", StringComparison.OrdinalIgnoreCase)
                ? UserRole.Admin
                : UserRole.User;

            var usernameExists = await dbContext.Users.AnyAsync(u => u.Username == username, ct);
            if (usernameExists) throw new InvalidOperationException("Username already exists");

            var emailExists = await dbContext.Users.AnyAsync(u => u.Email == email, ct);
            if (emailExists) throw new InvalidOperationException("Email already exists");

            var user = new User
            {
                Username = username,
                Email = email,
                PasswordHash = HashPassword(request.Password),
                Role = role,
                CreatedAtUtc = DateTime.UtcNow,
                IsActive = true
            };

            dbContext.Users.Add(user);
            await dbContext.SaveChangesAsync(ct);

            var expiresAt = DateTime.UtcNow.AddMinutes(15);
            var token = GenerateJwtToken(user, expiresAt);

            return new AuthResponse
            {
                Token = token,
                ExpiresAt = expiresAt,
                Username = user.Username,
                Role = user.Role.ToString()
            };
        }

        public string HashPassword(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password, BCrypt.Net.BCrypt.GenerateSalt(12));
        }

        public bool VerifyPassword(string password, string hash)
        {
            return BCrypt.Net.BCrypt.Verify(password, hash);
        }

        private string GenerateJwtToken(User user, DateTime expiresAtUtc)
        {
            var handler = new JwtSecurityTokenHandler();
            var keyBytes = Encoding.UTF8.GetBytes(jwtKey);

            var identity = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role.ToString()),
                new Claim("jti", Guid.NewGuid().ToString())
            });

            var descriptor = new SecurityTokenDescriptor
            {
                Subject = identity,
                NotBefore = DateTime.UtcNow,
                Expires = expiresAtUtc,
                Issuer = jwtIssuer,
                Audience = jwtAudience,
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(keyBytes), SecurityAlgorithms.HmacSha256)
            };

            var token = handler.CreateToken(descriptor);
            return handler.WriteToken(token);
        }
    }
}
