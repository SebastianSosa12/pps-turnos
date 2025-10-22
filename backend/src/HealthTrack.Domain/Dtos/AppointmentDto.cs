using System;

namespace HealthTrack.Domain.Dtos;

public class AppointmentDto
{
  public Guid PatientId { get; set; }
  public Guid ProviderId { get; set; }
  public DateTime StartsAtUtc { get; set; }
  public DateTime EndsAtUtc { get; set; }
  public string? Notes { get; set; }
}
