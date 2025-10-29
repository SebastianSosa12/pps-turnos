using System.ComponentModel.DataAnnotations;

namespace HealthTrack.Domain.Dtos
{
  public sealed class DoctorDto
  {
    [Required]
    [StringLength(100)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [StringLength(254)]
    public string Email { get; set; } = string.Empty;

    [StringLength(100)]
    public string Specialty { get; set; } = string.Empty;
  }
}
