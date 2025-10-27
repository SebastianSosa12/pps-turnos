using System;

namespace HealthTrack.Domain.Dtos;

public class PatientDto
{
  public string FullName { get; set; } = null!;
  public string Email { get; set; } = null!;
  public DateTime DateOfBirth { get; set; }
}

