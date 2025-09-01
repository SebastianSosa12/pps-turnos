namespace HealthTrack.Domain.Entities;
public class Patient { public Guid Id {get;set;} = Guid.NewGuid(); public string FullName {get;set;} = string.Empty; }
