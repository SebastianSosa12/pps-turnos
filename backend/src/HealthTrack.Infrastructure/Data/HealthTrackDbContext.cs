using HealthTrack.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace HealthTrack.Infrastructure.Data;

public class HealthTrackDbContext(DbContextOptions<HealthTrackDbContext> options) : DbContext(options)
{
  public DbSet<Patient> Patients => Set<Patient>();
  public DbSet<Provider> Providers => Set<Provider>();
  public DbSet<Appointment> Appointments => Set<Appointment>();
  public DbSet<User> Users => Set<User>();
}
