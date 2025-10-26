using System.ComponentModel.DataAnnotations;

namespace HealthTrack.Domain.Dtos
{
  public class LoginRequest
  {
    [Required]
    public string? Username { get; set; }

    [EmailAddress]
    public string? Email { get; set; }

    [Required]
    public string Password { get; set; } = string.Empty;
  }
}
