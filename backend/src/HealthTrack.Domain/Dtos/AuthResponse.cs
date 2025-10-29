using System;

namespace HealthTrack.Domain.Dtos
{
  public class AuthResponse
  {
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Role { get; set; } = "User";
  }
}
