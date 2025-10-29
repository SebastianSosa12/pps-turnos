using System;
using System.ComponentModel.DataAnnotations;

namespace HealthTrack.Domain.Dtos
{
  public sealed class PatientDto
  {
    [Required]
    [StringLength(100)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [StringLength(254)]
    public string Email { get; set; } = string.Empty;

    public DateTime DateOfBirth { get; set; }
  }
}
