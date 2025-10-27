using HealthTrack.Api.Dtos;
using HealthTrack.Domain.Entities;
using HealthTrack.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HealthTrack.Api.Controllers;

[AllowAnonymous]
// [Authorize] // habilitar cuando el auth esté listo
[ApiController]
[Route("api/doctors")]
public class DoctorsController : ControllerBase
{
    private readonly HealthTrackDbContext _db;
    public DoctorsController(HealthTrackDbContext db) { _db = db; }

    /// <summary>
    /// Autocomplete de doctores.
    /// GET /api/doctors?doctorName=Ca&limit=10 -> devuelve { id, fullName } de los que contienen "Ca"
    /// Si no se envía doctorName, devuelve hasta 'limit' ordenados por nombre.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> Get(
        [FromQuery] string? doctorName,
        [FromQuery] int limit = 10,
        CancellationToken ct = default)
    {
        var max = Math.Clamp(limit, 1, 50);
        var query = _db.Providers.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(doctorName))
        {
            var term = doctorName.Trim().ToLower();
            query = query.Where(d => d.FullName.ToLower().Contains(term));
        }

        var items = await query
            .OrderBy(d => d.FullName)
            .Take(max)
            .ToListAsync(ct);

        return Ok(items);
    }

    [HttpPost]
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
