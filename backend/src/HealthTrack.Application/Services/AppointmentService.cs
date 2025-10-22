
using System;
using System.Threading.Tasks;
using HealthTrack.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using HealthTrack.Infrastructure.Data;

namespace HealthTrack.Application.Services;

public sealed class AppointmentService(HealthTrackDbContext db)
{
  public async Task<Appointment> CreateAsync(Appointment appt, System.Threading.CancellationToken ct = default)
    {
        if (appt.StartsAtUtc >= appt.EndsAtUtc) throw new ArgumentException("StartsAtUtc must be before EndsAtUtc");
        bool overlaps = await db.Appointments.AnyAsync(a => a.ProviderId == appt.ProviderId && a.StartsAtUtc < appt.EndsAtUtc && appt.StartsAtUtc < a.EndsAtUtc, ct);
        if (overlaps) throw new InvalidOperationException("Overlapping appointment for provider");
        db.Appointments.Add(appt);
        await db.SaveChangesAsync(ct);
        return appt;
    }
}
