
using HealthTrack.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace HealthTrack.Infrastructure.Data;

public class HealthTrackDbContext : DbContext
{
    public HealthTrackDbContext(DbContextOptions<HealthTrackDbContext> options) : base(options) { }
    public DbSet<Patient> Patients => Set<Patient>();
    public DbSet<Provider> Providers => Set<Provider>();
    public DbSet<Appointment> Appointments => Set<Appointment>();
}
