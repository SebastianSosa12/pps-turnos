using HealthTrack.Application.Services;
using HealthTrack.Domain.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace HealthTrack.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(IAuthService authService, ILogger<AuthController> logger) : ControllerBase
{
    /// <summary>
    /// Authenticate user and return JWT token
    /// </summary>
    /// <param name="request">Login credentials</param>
    /// <param name="ct">Cancellation token</param>
    /// <returns>JWT token with 15-minute expiration</returns>
    [HttpPost("token")]
    public async Task<IActionResult> GetToken([FromBody] LoginRequest request, CancellationToken ct)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new { error = "Invalid request", details = ModelState });
        }

        try
        {
            var result = await authService.AuthenticateAsync(request, ct);
            
            if (result == null)
            {
                logger.LogWarning("Failed login attempt for username: {Username}", request.Username);
                return Unauthorized(new { error = "Invalid username or password" });
            }

            logger.LogInformation("Successful login for username: {Username}", request.Username);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error during authentication for username: {Username}", request.Username);
            return StatusCode(500, new { error = "An error occurred during authentication" });
        }
    }
}
