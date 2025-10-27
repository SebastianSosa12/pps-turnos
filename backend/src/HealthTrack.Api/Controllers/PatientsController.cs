using HealthTrack.Domain.Dtos;
using HealthTrack.Domain.Entities;
using HealthTrack.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HealthTrack.Api.Controllers;

[AllowAnonymous]
// [Authorize] // habilitar cuando el auth esté listo
[ApiController]
[Route("api/[controller]")]
public class PatientsController : ControllerBase
{
    private readonly HealthTrackDbContext _db;
    public PatientsController(HealthTrackDbContext db) => _db = db;

    /// <summary>
    /// Autocomplete de pacientes.
    /// GET /api/patients?q=An&limit=10 -> devuelve { id, fullName } de los que empiezan con "An"
    /// </summary>
    [HttpGet]
    // [Authorize] // habilitar cuando el auth esté listo
    public async Task<IActionResult> Get(
        [FromQuery] string? q,
        [FromQuery] int limit = 10,
        CancellationToken ct = default)
    {
        var max = Math.Clamp(limit, 1, 50);

        var query = _db.Patients.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(q))
        {
            var pattern = q.Trim() + "%";
            query = query.Where(p => EF.Functions.Like(p.FullName, pattern));
        }

        var list = await query
            .OrderBy(p => p.FullName)
            .Select(p => new
            {
                id = p.Id,
                fullName = p.FullName
            })
            .Take(max)
            .ToListAsync(ct);

        return Ok(list);
    }

    [HttpPost]
    // [Authorize] // habilitar cuando el auth esté listo
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

        _db.Patients.Add(entity);
        await _db.SaveChangesAsync(ct);

        return Created($"/api/patients/{entity.Id}", new
        {
            id = entity.Id,
            fullName = entity.FullName,
            email = entity.Email
        });
    }
}
