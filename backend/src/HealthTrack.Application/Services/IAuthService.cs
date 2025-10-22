using System.Threading;
using System.Threading.Tasks;
using HealthTrack.Domain.Dtos;

namespace HealthTrack.Application.Services
{
    public interface IAuthService
    {
        Task<AuthResponse?> AuthenticateAsync(LoginRequest request, CancellationToken ct = default);
        string HashPassword(string password);
        bool VerifyPassword(string password, string hash);
    }
}
