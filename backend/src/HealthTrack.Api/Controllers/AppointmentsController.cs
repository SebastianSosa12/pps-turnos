using HealthTrack.Application.Services;
using HealthTrack.Domain.Dtos;
using HealthTrack.Domain.Entities;
using HealthTrack.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HealthTrack.Api.Controllers;

[Authorize(Policy = "ReadOnlyUser")]
[ApiController]
[Route("api/[controller]")]
public class AppointmentsController(
    HealthTrackDbContext db,
    AppointmentService svc,
    IFeatureFlagService flags,
    ILogger<AppointmentsController> logger) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get(
        [FromQuery] string? searchText,
        [FromQuery] DateTime? fromUtc,
        [FromQuery] DateTime? toUtc,
        [FromQuery] Guid? providerId,
        [FromQuery] int limit = 200,
        CancellationToken cancellationToken = default)
    {
        if (fromUtc.HasValue && toUtc.HasValue && fromUtc > toUtc)
            return BadRequest(new { error = "fromUtc must be less than or equal to toUtc" });

        var max = Math.Clamp(limit, 1, 500);
        IQueryable<Appointment> query = db.Appointments.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(searchText))
        {
            var like = $"%{searchText.Trim()}%";
            query = query.Where(a =>
                (a.Notes != null && EF.Functions.Like(a.Notes, like)) ||
                db.Patients.Any(p => p.Id == a.PatientId && EF.Functions.Like(p.FullName, like)) ||
                db.Providers.Any(pr => pr.Id == a.ProviderId &&
                                       (EF.Functions.Like(pr.FullName, like) ||
                                        EF.Functions.Like(pr.Specialty, like))));
        }

        if (fromUtc.HasValue) query = query.Where(a => a.StartsAtUtc >= fromUtc.Value);
        if (toUtc.HasValue) query = query.Where(a => a.EndsAtUtc <= toUtc.Value);
        if (providerId.HasValue) query = query.Where(a => a.ProviderId == providerId.Value);

        var list = await query
            .OrderByDescending(a => a.StartsAtUtc)
            .Take(max)
            .ToListAsync(cancellationToken);

        return Ok(list);
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] AppointmentDto dto, CancellationToken cancellationToken)
    {
        if (dto.StartsAtUtc > dto.EndsAtUtc)
            return BadRequest(new { error = "endsAtUtc must be greater than or equal to startsAtUtc" });

        var entity = new Appointment
        {
            PatientId = dto.PatientId,
            ProviderId = dto.ProviderId,
            StartsAtUtc = DateTime.SpecifyKind(dto.StartsAtUtc, DateTimeKind.Utc),
            EndsAtUtc = DateTime.SpecifyKind(dto.EndsAtUtc, DateTimeKind.Utc),
            Notes = dto.Notes
        };

        try
        {
            var created = await svc.CreateAsync(entity, cancellationToken);

            if (await flags.IsEnabledAsync("appointments.reminders.enabled", cancellationToken))
                logger.LogInformation("Would enqueue reminder for appointment {AppointmentId}", created.Id);

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

    [Authorize(Policy = "AdminOnly")]
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] AppointmentDto dto, CancellationToken cancellationToken)
    {
        if (dto.StartsAtUtc > dto.EndsAtUtc)
            return BadRequest(new { error = "endsAtUtc must be greater than or equal to startsAtUtc" });

        var entity = await db.Appointments.FirstOrDefaultAsync(a => a.Id == id, cancellationToken);
        if (entity is null) return NotFound();

        entity.PatientId = dto.PatientId;
        entity.ProviderId = dto.ProviderId;
        entity.StartsAtUtc = DateTime.SpecifyKind(dto.StartsAtUtc, DateTimeKind.Utc);
        entity.EndsAtUtc = DateTime.SpecifyKind(dto.EndsAtUtc, DateTimeKind.Utc);
        entity.Notes = dto.Notes;

        await db.SaveChangesAsync(cancellationToken);
        return Ok(entity);
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var entity = await db.Appointments.FirstOrDefaultAsync(a => a.Id == id, cancellationToken);
        if (entity is null) return NotFound();

        db.Appointments.Remove(entity);
        await db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }
}
