using HealthTrack.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HealthTrack.Api.Controllers;

[ApiController]
[Route("api/feature-flags")]
public class FeatureFlagsController(IFeatureFlagService flags) : ControllerBase
{
  [AllowAnonymous]
  [HttpGet]
  public async Task<IActionResult> Get(CancellationToken cancellationToken)
  {
    var snapshot = await flags.SnapshotAsync(cancellationToken);
    return Ok(snapshot);
  }
}
