
using System.Text.Json.Serialization;
using HealthTrack.Application.Services;
using HealthTrack.Infrastructure.Data;
using HealthTrack.Infrastructure.Features;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HealthTrack.Domain.Entities;

var builder = WebApplication.CreateBuilder(args);

builder.Services.ConfigureHttpJsonOptions(o => { o.SerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull; });

var connString = builder.Configuration.GetConnectionString("Default") ?? Environment.GetEnvironmentVariable("ConnectionStrings__Default");
if (string.IsNullOrWhiteSpace(connString)) throw new InvalidOperationException("Missing connection string 'Default'");
builder.Services.AddDbContext<HealthTrackDbContext>(opt => opt.UseSqlServer(connString));

var serviceUrl = builder.Configuration["AWS:ServiceURL"] ?? Environment.GetEnvironmentVariable("AWS__ServiceURL");
var fallbackPath = builder.Configuration["FeatureFlags:FallbackPath"];
var provider = DynamoFeatureFlagProvider.Create(serviceUrl);
builder.Services.AddSingleton<IFeatureFlagService>(new FeatureFlagService(provider, fallbackPath));
builder.Services.AddScoped<AppointmentService>();

var app = builder.Build();
using (var scope = app.Services.CreateScope()) { var db = scope.ServiceProvider.GetRequiredService<HealthTrackDbContext>(); db.Database.EnsureCreated(); }

app.MapGet("/api/health", () => Results.Ok(new { status = "ok" }));
app.MapGet("/api/feature-flags", async (IFeatureFlagService flags, CancellationToken ct) => Results.Ok(await flags.SnapshotAsync(ct)));
app.MapGet("/api/patients", async (HealthTrackDbContext db, [FromQuery] string? q, CancellationToken ct) => {
    var query = db.Patients.AsQueryable(); if (!string.IsNullOrWhiteSpace(q)) query = query.Where(p => p.FullName.Contains(q));
    var list = await query.OrderBy(p => p.FullName).ToListAsync(ct); return Results.Ok(list);
});
app.MapPost("/api/patients", async (HealthTrackDbContext db, PatientDto dto, CancellationToken ct) => {
    if (string.IsNullOrWhiteSpace(dto.FullName) || string.IsNullOrWhiteSpace(dto.Email)) return Results.BadRequest(new { error = "FullName and Email are required" });
    var entity = new Patient { FullName = dto.FullName, Email = dto.Email, DateOfBirth = dto.DateOfBirth };
    db.Patients.Add(entity); await db.SaveChangesAsync(ct); return Results.Created($"/api/patients/{entity.Id}", entity);
});
app.MapGet("/api/appointments", async (HealthTrackDbContext db, DateTime? from, DateTime? to, Guid? providerId, CancellationToken ct) => {
    var q = db.Appointments.AsQueryable(); if (from.HasValue) q = q.Where(a => a.StartsAtUtc >= from); if (to.HasValue) q = q.Where(a => a.EndsAtUtc <= to); if (providerId.HasValue) q = q.Where(a => a.ProviderId == providerId);
    var list = await q.OrderBy(a => a.StartsAtUtc).ToListAsync(ct); return Results.Ok(list);
});
app.MapPost("/api/appointments", async (HealthTrackDbContext db, AppointmentService svc, IFeatureFlagService flags, AppointmentDto dto, CancellationToken ct) => {
    var entity = new Appointment { PatientId = dto.PatientId, ProviderId = dto.ProviderId, StartsAtUtc = dto.StartsAtUtc, EndsAtUtc = dto.EndsAtUtc, Notes = dto.Notes };
    try {
        var created = await svc.CreateAsync(entity, ct);
        if (await flags.IsEnabledAsync("appointments.reminders.enabled", ct)) { app.Logger.LogInformation("Would enqueue reminder for appointment {AppointmentId}", created.Id); }
        return Results.Created($"/api/appointments/{created.Id}", created);
    } catch (ArgumentException ex) { return Results.BadRequest(new { error = ex.Message }); }
      catch (InvalidOperationException ex) { return Results.Conflict(new { error = ex.Message }); }
});
app.Run();

public record PatientDto(string FullName, DateTime DateOfBirth, string Email);
public record AppointmentDto(Guid PatientId, Guid ProviderId, DateTime StartsAtUtc, DateTime EndsAtUtc, string? Notes);
