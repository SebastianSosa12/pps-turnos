using HealthTrack.Domain.Dtos;
using HealthTrack.Domain.Entities;
using HealthTrack.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HealthTrack.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PatientsController(HealthTrackDbContext db) : ControllerBase
{
  // GET /api/patients?q=...
  [HttpGet]
  public async Task<IActionResult> Get([FromQuery] string? q, CancellationToken ct)
  {
    var query = db.Patients.AsQueryable();
    if (!string.IsNullOrWhiteSpace(q))
      query = query.Where(p => p.FullName.Contains(q));

    var list = await query.OrderBy(p => p.FullName).ToListAsync(ct);
    return Ok(list);
  }

  // POST /api/patients
  [HttpPost]
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
