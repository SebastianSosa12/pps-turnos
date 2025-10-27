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
public class PatientsController : ControllerBase
{
  private readonly HealthTrackDbContext _db;
  public PatientsController(HealthTrackDbContext db) => _db = db;

  [HttpGet]
  public async Task<ActionResult<IEnumerable<Patient>>> Get(
    [FromQuery] string? patientName,
    [FromQuery] int limit = 10,
    CancellationToken ct = default)
  {
    var max = Math.Clamp(limit, 1, 50);

    var query = _db.Patients.AsNoTracking();

    if (!string.IsNullOrWhiteSpace(patientName))
    {
      var term = patientName.Trim().ToLower();
      query = query.Where(p => p.FullName.ToLower().Contains(term));
    }

    var list = await query
      .OrderBy(p => p.FullName)
      .Take(max)
      .ToListAsync(ct);

    return Ok(list);
  }

  [HttpPost]
  public async Task<ActionResult<Patient>> Create([FromBody] PatientDto dto, CancellationToken ct)
  {
    if (string.IsNullOrWhiteSpace(dto.FullName) || string.IsNullOrWhiteSpace(dto.Email))
      return BadRequest(new { error = "FullName and Email are required" });

    var entity = new Patient
    {
      FullName = dto.FullName,
      Email = dto.Email,
      DateOfBirth = dto.DateOfBirth
    };

    _db.Patients.Add(entity);
    await _db.SaveChangesAsync(ct);

    return Created($"/api/patients/{entity.Id}", entity);
  }
}
