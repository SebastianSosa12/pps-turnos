using HealthTrack.Domain.Dtos;
using HealthTrack.Domain.Entities;
using HealthTrack.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HealthTrack.Api.Controllers;

[Authorize(Policy = "ReadOnlyUser")]
[ApiController]
[Route("api/[controller]")]
public class PatientsController : ControllerBase
{
    private readonly HealthTrackDbContext db;

    public PatientsController(HealthTrackDbContext db)
    {
        this.db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Patient>>> Get(
        [FromQuery] string? patientName,
        [FromQuery] int limit = 10,
        CancellationToken cancellationToken = default)
    {
        var max = Math.Clamp(limit, 1, 50);
        IQueryable<Patient> query = db.Patients.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(patientName))
        {
            var like = $"%{patientName.Trim()}%";
            query = query.Where(p =>
                EF.Functions.Like(p.FullName, like) ||
                EF.Functions.Like(p.Email, like));
        }

        var list = await query
            .OrderBy(p => p.FullName)
            .Take(max)
            .ToListAsync(cancellationToken);

        return Ok(list);
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpPost]
    public async Task<ActionResult<Patient>> Create([FromBody] PatientDto dto, CancellationToken cancellationToken)
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
        await db.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(nameof(Get), new { id = entity.Id }, entity);
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<Patient>> Update(Guid id, [FromBody] PatientDto dto, CancellationToken cancellationToken)
    {
        var entity = await db.Patients.FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
        if (entity is null) return NotFound();

        entity.FullName = dto.FullName;
        entity.Email = dto.Email;
        entity.DateOfBirth = dto.DateOfBirth;

        await db.SaveChangesAsync(cancellationToken);
        return Ok(entity);
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var entity = await db.Patients.FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
        if (entity is null) return NotFound();

        db.Patients.Remove(entity);
        await db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }
}
