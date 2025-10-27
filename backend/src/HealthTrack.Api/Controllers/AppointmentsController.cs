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
      var s = searchText.Trim().ToLower();
      query = query.Where(a =>
        a.PatientId.ToString().ToLower().Contains(s) ||
        a.ProviderId.ToString().ToLower().Contains(s) ||
        (a.Notes != null && a.Notes.ToLower().Contains(s)));
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
}
