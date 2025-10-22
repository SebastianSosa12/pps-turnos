using HealthTrack.Application.Services;
using HealthTrack.Domain.Dtos;
using HealthTrack.Domain.Entities;
using HealthTrack.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HealthTrack.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AppointmentsController(
  HealthTrackDbContext db,
  AppointmentService svc,
  IFeatureFlagService flags,
  ILogger<AppointmentsController> logger)
  : ControllerBase
{
  // GET /api/appointments?from=...&to=...&providerId=...
    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] DateTime? from, [FromQuery] DateTime? to, [FromQuery] Guid? providerId, CancellationToken ct)
    {
        var q = db.Appointments.AsQueryable();
        if (from.HasValue) q = q.Where(a => a.StartsAtUtc >= from);
        if (to.HasValue) q = q.Where(a => a.EndsAtUtc <= to);
        if (providerId.HasValue) q = q.Where(a => a.ProviderId == providerId);

        var list = await q.OrderBy(a => a.StartsAtUtc).ToListAsync(ct);
        return Ok(list);
    }

    // POST /api/appointments
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] AppointmentDto dto, CancellationToken ct)
    {
        var entity = new Appointment
        {
            PatientId = dto.PatientId,
            ProviderId = dto.ProviderId,
            StartsAtUtc = dto.StartsAtUtc,
            EndsAtUtc = dto.EndsAtUtc,
            Notes = dto.Notes
        };

        try
        {
            var created = await svc.CreateAsync(entity, ct);

            if (await flags.IsEnabledAsync("appointments.reminders.enabled", ct))
            {
                // Demo: just log for now
                logger.LogInformation("Would enqueue reminder for appointment {AppointmentId}", created.Id);
            }

            return Created($"/api/appointments/{created.Id}", created);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
    }
}
