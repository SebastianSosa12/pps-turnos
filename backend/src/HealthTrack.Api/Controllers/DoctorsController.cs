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
public class DoctorsController : ControllerBase
{
  private readonly HealthTrackDbContext _db;
  public DoctorsController(HealthTrackDbContext db) => _db = db;

  [HttpGet]
  public async Task<ActionResult<IEnumerable<Provider>>> Get(
    [FromQuery] string? doctorName,
    [FromQuery] int limit = 10,
    CancellationToken ct = default)
  {
    var max = Math.Clamp(limit, 1, 50);
    var query = _db.Providers.AsNoTracking();

    if (!string.IsNullOrWhiteSpace(doctorName))
    {
      var term = doctorName.Trim().ToLower();
      query = query.Where(d =>
        d.FullName.ToLower().Contains(term) ||
        d.Specialty.ToLower().Contains(term)
      );
    }

    var list = await query
      .OrderBy(d => d.FullName)
      .Take(max)
      .ToListAsync(ct);

    return Ok(list);
  }

  [HttpPost]
  public async Task<ActionResult<Provider>> Create([FromBody] DoctorDto dto, CancellationToken ct)
  {
    if (string.IsNullOrWhiteSpace(dto.FullName) || string.IsNullOrWhiteSpace(dto.Email))
      return BadRequest(new { error = "FullName and Email are required" });

    var entity = new Provider
    {
      FullName = dto.FullName,
      Email = dto.Email,
      Specialty = dto.Specialty ?? string.Empty
    };

    _db.Providers.Add(entity);
    await _db.SaveChangesAsync(ct);

    return Created($"/api/doctors/{entity.Id}", entity);
  }

  [HttpPut("{id}")]
  public async Task<ActionResult<Provider>> Update(string id, [FromBody] DoctorDto dto, CancellationToken ct)
  {
    if (string.IsNullOrWhiteSpace(dto.FullName) || string.IsNullOrWhiteSpace(dto.Email))
      return BadRequest(new { error = "FullName and Email are required" });

    if (!Guid.TryParse(id, out var guid)) return NotFound();

    var doctor = await _db.Providers.FirstOrDefaultAsync(p => p.Id == guid, ct);
    if (doctor is null) return NotFound();

    doctor.FullName = dto.FullName;
    doctor.Email = dto.Email;
    doctor.Specialty = dto.Specialty ?? string.Empty;

    await _db.SaveChangesAsync(ct);
    return Ok(doctor);
  }

  [HttpDelete("{id}")]
  public async Task<IActionResult> Delete(string id, CancellationToken ct)
  {
    if (!Guid.TryParse(id, out var guid)) return NotFound();

    var doctor = await _db.Providers.FirstOrDefaultAsync(p => p.Id == guid, ct);
    if (doctor is null) return NotFound();

    _db.Providers.Remove(doctor);
    await _db.SaveChangesAsync(ct);
    return NoContent();
  }
}
