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
  // GET /api/appointments?q=&from=&to=&providerId=
  [HttpGet]
  public async Task<IActionResult> Get(
    [FromQuery] string? q,
    [FromQuery] DateTime? from,
    [FromQuery] DateTime? to,
    [FromQuery] Guid? providerId,
    CancellationToken ct)
  {
    var query = db.Appointments.AsNoTracking().AsQueryable();

    if (!string.IsNullOrWhiteSpace(q))
    {
      var s = q.Trim().ToLower();
      query = query.Where(a =>
        a.PatientId.ToString().ToLower().Contains(s) ||
        a.ProviderId.ToString().ToLower().Contains(s));
    }

    if (from.HasValue) query = query.Where(a => a.StartsAtUtc >= from.Value);
    if (to.HasValue) query = query.Where(a => a.EndsAtUtc <= to.Value);
    if (providerId.HasValue) query = query.Where(a => a.ProviderId == providerId.Value);

    var list = await query
      .OrderByDescending(a => a.StartsAtUtc)
      .ToListAsync(ct);

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
