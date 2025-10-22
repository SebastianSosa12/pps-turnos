using System;

namespace HealthTrack.Domain.Dtos;

public class PatientDto
{
  public string FullName { get; set; }
  public DateTime DateOfBirth { get; set; }
  public string Email { get; set; }
}
