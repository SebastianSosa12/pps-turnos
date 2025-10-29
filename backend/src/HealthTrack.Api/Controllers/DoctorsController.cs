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
public class DoctorsController : ControllerBase
{
    private readonly HealthTrackDbContext db;

    public DoctorsController(HealthTrackDbContext db)
    {
        this.db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Provider>>> Get(
        [FromQuery] string? doctorName,
        [FromQuery] int limit = 10,
        CancellationToken cancellationToken = default)
    {
        var max = Math.Clamp(limit, 1, 50);
        IQueryable<Provider> query = db.Providers.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(doctorName))
        {
            var like = $"%{doctorName.Trim()}%";
            query = query.Where(d =>
                EF.Functions.Like(d.FullName, like) ||
                EF.Functions.Like(d.Email, like) ||
                EF.Functions.Like(d.Specialty, like));
        }

        var list = await query
            .OrderBy(d => d.FullName)
            .Take(max)
            .ToListAsync(cancellationToken);

        return Ok(list);
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpPost]
    public async Task<ActionResult<Provider>> Create([FromBody] DoctorDto dto, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(dto.FullName) || string.IsNullOrWhiteSpace(dto.Email))
            return BadRequest(new { error = "FullName and Email are required" });

        var entity = new Provider
        {
            FullName = dto.FullName,
            Email = dto.Email,
            Specialty = dto.Specialty ?? string.Empty
        };

        db.Providers.Add(entity);
        await db.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(nameof(Get), new { id = entity.Id }, entity);
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<Provider>> Update(Guid id, [FromBody] DoctorDto dto, CancellationToken cancellationToken)
    {
        var entity = await db.Providers.FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
        if (entity is null) return NotFound();

        if (string.IsNullOrWhiteSpace(dto.FullName) || string.IsNullOrWhiteSpace(dto.Email))
            return BadRequest(new { error = "FullName and Email are required" });

        entity.FullName = dto.FullName;
        entity.Email = dto.Email;
        entity.Specialty = dto.Specialty ?? string.Empty;

        await db.SaveChangesAsync(cancellationToken);
        return Ok(entity);
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var entity = await db.Providers.FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
        if (entity is null) return NotFound();

        db.Providers.Remove(entity);
        await db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }
}
