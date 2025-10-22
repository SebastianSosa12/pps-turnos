using System;
using System.IdentityModel.Tokens.Jwt;
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
using BCrypt.Net;

namespace HealthTrack.Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly HealthTrackDbContext _db;
        private readonly IConfiguration _config;
        private readonly string _jwtSecret;
        private readonly string _jwtIssuer;
        private readonly string _jwtAudience;

        public AuthService(HealthTrackDbContext db, IConfiguration config)
        {
            _db = db;
            _config = config;
            _jwtSecret = _config["Jwt:Secret"] ?? throw new InvalidOperationException("JWT Secret not configured");
            _jwtIssuer = _config["Jwt:Issuer"] ?? "HealthTrack";
            _jwtAudience = _config["Jwt:Audience"] ?? "HealthTrack";
        }

        public async Task<AuthResponse?> AuthenticateAsync(LoginRequest request, CancellationToken ct = default)
        {
            // Find user by username
            var user = await _db.Users
                .FirstOrDefaultAsync(u => u.Username == request.Username && u.IsActive, ct);

            if (user == null || !VerifyPassword(request.Password, user.PasswordHash))
                return null;

            // Update last login
            user.LastLoginUtc = DateTime.UtcNow;
            await _db.SaveChangesAsync(ct);

            // Generate JWT token
            var token = GenerateJwtToken(user);
            var expiresAt = DateTime.UtcNow.AddMinutes(15);

            return new AuthResponse
            {
                Token = token,
                ExpiresAt = expiresAt,
                Username = user.Username
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

        private string GenerateJwtToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_jwtSecret);
            
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Name, user.Username),
                    new Claim("jti", Guid.NewGuid().ToString())
                }),
                Expires = DateTime.UtcNow.AddMinutes(15),
                Issuer = _jwtIssuer,
                Audience = _jwtAudience,
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key), 
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}
