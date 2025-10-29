using HealthTrack.Application.Services;
using HealthTrack.Domain.Dtos;
using HealthTrack.Domain.Entities;
using HealthTrack.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HealthTrack.Api.Controllers;

[AllowAnonymous]
[ApiController]
[Route("api/[controller]")]
public class AppointmentsController(
  HealthTrackDbContext db,
  AppointmentService svc,
  IFeatureFlagService flags,
  ILogger<AppointmentsController> logger)
  : ControllerBase
{
  [HttpGet]
  public async Task<IActionResult> Get(
    [FromQuery] string? searchText,
    [FromQuery] DateTime? fromUtc,
    [FromQuery] DateTime? toUtc,
    [FromQuery] Guid? providerId,
    [FromQuery] int limit = 200,
    CancellationToken ct = default)
  {
    var max = Math.Clamp(limit, 1, 500);

    var query = db.Appointments.AsNoTracking().AsQueryable();

    if (!string.IsNullOrWhiteSpace(searchText))
    {
      var term = searchText.Trim().ToLower();

      query = query.Where(a =>
        (a.Notes != null && a.Notes.ToLower().Contains(term)) ||
        db.Patients.Any(p => p.Id == a.PatientId && p.FullName.ToLower().Contains(term)) ||
        db.Providers.Any(pr => pr.Id == a.ProviderId &&
                               (pr.FullName.ToLower().Contains(term) ||
                                (pr.Specialty.ToLower().Contains(term))))
      );
    }
    
    if (fromUtc.HasValue) query = query.Where(a => a.StartsAtUtc >= fromUtc.Value);
    if (toUtc.HasValue) query = query.Where(a => a.EndsAtUtc <= toUtc.Value);
    if (providerId.HasValue) query = query.Where(a => a.ProviderId == providerId.Value);

    var list = await query
      .OrderByDescending(a => a.StartsAtUtc)
      .Take(max)
      .ToListAsync(ct);

    return Ok(list);
  }

  [HttpPost]
  public async Task<IActionResult> Create([FromBody] AppointmentDto dto, CancellationToken ct)
  {
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
      var created = await svc.CreateAsync(entity, ct);

      if (await flags.IsEnabledAsync("appointments.reminders.enabled", ct))
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

  [HttpPut("{id:guid}")]
  public async Task<IActionResult> Update(Guid id, [FromBody] AppointmentDto dto, CancellationToken ct)
  {
    var entity = await db.Appointments.FirstOrDefaultAsync(a => a.Id == id, ct);
    if (entity is null) return NotFound();

    entity.PatientId = dto.PatientId;
    entity.ProviderId = dto.ProviderId;
    entity.StartsAtUtc = DateTime.SpecifyKind(dto.StartsAtUtc, DateTimeKind.Utc);
    entity.EndsAtUtc = DateTime.SpecifyKind(dto.EndsAtUtc, DateTimeKind.Utc);
    entity.Notes = dto.Notes;

    await db.SaveChangesAsync(ct);
    return Ok(entity);
  }

  [HttpDelete("{id:guid}")]
  public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
  {
    var entity = await db.Appointments.FirstOrDefaultAsync(a => a.Id == id, ct);
    if (entity is null) return NotFound();

    db.Appointments.Remove(entity);
    await db.SaveChangesAsync(ct);
    return NoContent();
  }
}
