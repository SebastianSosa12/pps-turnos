
using HealthTrack.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using HealthTrack.Infrastructure.Data;

namespace HealthTrack.Application.Services;

public sealed class AppointmentService
{
    private readonly HealthTrackDbContext _db;
    public AppointmentService(HealthTrackDbContext db) => _db = db;

    public async Task<Appointment> CreateAsync(Appointment appt, System.Threading.CancellationToken ct = default)
    {
        if (appt.StartsAtUtc >= appt.EndsAtUtc) throw new ArgumentException("StartsAtUtc must be before EndsAtUtc");
        bool overlaps = await _db.Appointments.AnyAsync(a => a.ProviderId == appt.ProviderId && a.StartsAtUtc < appt.EndsAtUtc && appt.StartsAtUtc < a.EndsAtUtc, ct);
        if (overlaps) throw new InvalidOperationException("Overlapping appointment for provider");
        _db.Appointments.Add(appt);
        await _db.SaveChangesAsync(ct);
        return appt;
    }
}
