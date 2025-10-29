namespace HealthTrack.Domain.Dtos;

public class DoctorDto
{
  public string FullName { get; set; } = null!;
  public string Email { get; set; } = null!;
  public string Specialty { get; set; } = string.Empty;
}
