using HealthTrack.Domain.Dtos;
using HealthTrack.Domain.Entities;
using HealthTrack.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HealthTrack.Api.Controllers;

[AllowAnonymous]
// [Authorize] // enable when auth is ready
[ApiController]
[Route("api/[controller]")]
public class PatientsController(HealthTrackDbContext db) : ControllerBase
{
  [HttpGet]
  // [Authorize] // enable when auth is ready
  public async Task<IActionResult> Get([FromQuery] string? q, CancellationToken ct)
  {
    var query = db.Patients.AsNoTracking().AsQueryable();

    if (!string.IsNullOrWhiteSpace(q))
    {
      var s = q.Trim().ToLower();
      query = query.Where(p =>
        p.FullName.ToLower().Contains(s) ||
        p.Email.ToLower().Contains(s));
    }

    var list = await query
      .OrderByDescending(p => p.CreatedAtUtc)
      .ToListAsync(ct);

    return Ok(list);
  }

  [HttpPost]
  // [Authorize] // enable when auth is ready
  public async Task<IActionResult> Create([FromBody] PatientDto dto, CancellationToken ct)
  {
    if (string.IsNullOrWhiteSpace(dto.FullName) || string.IsNullOrWhiteSpace(dto.Email))
      return BadRequest(new { error = "FullName and Email are required" });

    var entity = new Patient
    {
      FullName = dto.FullName,
      Email = dto.Email,
      DateOfBirth = dto.DateOfBirth
    };

    db.Patients.Add(entity);
    await db.SaveChangesAsync(ct);

    return Created($"/api/patients/{entity.Id}", entity);
  }
}
