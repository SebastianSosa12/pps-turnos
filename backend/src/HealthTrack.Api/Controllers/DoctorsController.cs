using HealthTrack.Api.Dtos;
using HealthTrack.Domain.Entities;
using HealthTrack.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HealthTrack.Api.Controllers;

[AllowAnonymous]
// [Authorize] // enable when auth is ready
[ApiController]
[Route("api/doctors")]
public class DoctorsController : ControllerBase
{
  private readonly HealthTrackDbContext _db;
  public DoctorsController(HealthTrackDbContext db) { _db = db; }

  [HttpGet]
  // [Authorize] // enable when auth is ready
  public async Task<ActionResult<IEnumerable<Provider>>> Get([FromQuery] string? q, CancellationToken ct)
  {
    var query = _db.Providers.AsNoTracking().AsQueryable();

    if (!string.IsNullOrWhiteSpace(q))
    {
      var s = q.Trim().ToLower();
      query = query.Where(d =>
        d.FullName.ToLower().Contains(s) ||
        d.Specialty.ToLower().Contains(s) ||
        d.Email.ToLower().Contains(s));
    }

    var items = await query.OrderBy(d => d.FullName).ToListAsync(ct);
    return Ok(items);
  }

  [HttpPost]
  // [Authorize] // enable when auth is ready
  public async Task<ActionResult<Provider>> Post([FromBody] CreateDoctorRequest body, CancellationToken ct)
  {
    if (string.IsNullOrWhiteSpace(body.FullName) || string.IsNullOrWhiteSpace(body.Email))
      return BadRequest(new { error = "FullName and Email are required" });

    var entity = new Provider
    {
      FullName = body.FullName,
      Specialty = body.Specialty ?? string.Empty,
      Email = body.Email
    };

    _db.Providers.Add(entity);
    await _db.SaveChangesAsync(ct);

    return Created($"/api/doctors/{entity.Id}", entity);
  }
}
