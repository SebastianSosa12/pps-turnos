using HealthTrack.Application.Services;
using HealthTrack.Domain.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HealthTrack.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(IAuthService authService, ILogger<AuthController> logger) : ControllerBase
{
    [AllowAnonymous]
    [HttpPost("token")]
    public async Task<IActionResult> GetToken([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { error = "Invalid request", details = ModelState });

        try
        {
            var authResult = await authService.AuthenticateAsync(request, cancellationToken);
            if (authResult == null)
            {
                logger.LogWarning("Failed login attempt for username: {Username}", request.Username);
                return Unauthorized(new { error = "Invalid username or password" });
            }

            logger.LogInformation("Successful login for username: {Username}", request.Username);
            return Ok(authResult);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error during authentication for username: {Username}", request.Username);
            return StatusCode(500, new { error = "An error occurred during authentication" });
        }
    }

    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { error = "Invalid request", details = ModelState });

        try
        {
            var registerResult = await authService.RegisterAsync(request, cancellationToken);
            return Ok(registerResult);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error during registration for username: {Username}", request.Username);
            return StatusCode(500, new { error = "An error occurred during registration" });
        }
    }
}
