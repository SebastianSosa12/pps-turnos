using HealthTrack.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace HealthTrack.Infrastructure.Data;

public class HealthTrackDbContext(DbContextOptions<HealthTrackDbContext> options) : DbContext(options)
{
  public DbSet<Patient> Patients => Set<Patient>();
  public DbSet<Provider> Providers => Set<Provider>();
  public DbSet<Appointment> Appointments => Set<Appointment>();
  public DbSet<User> Users => Set<User>();

  protected override void OnModelCreating(ModelBuilder modelBuilder)
  {
    var user = modelBuilder.Entity<User>();

    user.HasIndex(u => u.Username).IsUnique();
    user.HasIndex(u => u.Email).IsUnique();

    user.Property(u => u.Username)
      .IsRequired()
      .HasMaxLength(100);

    user.Property(u => u.Email)
      .IsRequired()
      .HasMaxLength(254);

    user.Property(u => u.PasswordHash)
      .IsRequired()
      .HasMaxLength(200);

    user.Property(u => u.Role).IsRequired();
    user.Property(u => u.CreatedAtUtc).IsRequired();
    user.Property(u => u.IsActive).IsRequired();
  }
}
