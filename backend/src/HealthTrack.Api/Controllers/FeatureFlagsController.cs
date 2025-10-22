using HealthTrack.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace HealthTrack.Api.Controllers;

[ApiController]
[Route("api/feature-flags")]
public class FeatureFlagsController(IFeatureFlagService flags) : ControllerBase
{
  [HttpGet]
  public async Task<IActionResult> Get(CancellationToken ct)
  {
    var snapshot = await flags.SnapshotAsync(ct);
    return Ok(snapshot);
  }
}
