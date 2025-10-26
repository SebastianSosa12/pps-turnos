namespace HealthTrack.Api.Dtos;

public class CreateDoctorRequest
{
  public string FullName { get; set; } = string.Empty;
  public string? Specialty { get; set; }
  public string Email { get; set; } = string.Empty;
}
