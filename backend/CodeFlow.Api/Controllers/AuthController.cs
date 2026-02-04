using Microsoft.AspNetCore.Mvc;
using CodeFlow.Api.DTOs;
using CodeFlow.Api.Services;

namespace CodeFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;

    public AuthController(IAuthService auth)
    {
        _auth = auth;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request, CancellationToken ct)
    {
        var result = await _auth.RegisterAsync(request, ct);
        if (result == null)
            return BadRequest(new { message = "Email already registered or invalid input (password min 6 characters)." });
        return Ok(result);
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request, CancellationToken ct)
    {
        var result = await _auth.LoginAsync(request, ct);
        if (result == null)
            return Unauthorized(new { message = "Invalid email or password." });
        return Ok(result);
    }

    [HttpPost("confirm-email")]
    public async Task<ActionResult> ConfirmEmail([FromQuery] string email, [FromQuery] string token, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(token))
            return BadRequest(new { message = "Email and token are required." });
        var ok = await _auth.ConfirmEmailAsync(email, token, ct);
        if (!ok)
            return BadRequest(new { message = "Invalid or expired confirmation link." });
        return Ok(new { message = "Email confirmed." });
    }

    [HttpPost("forgot-password")]
    public async Task<ActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request, CancellationToken ct)
    {
        await _auth.RequestPasswordResetAsync(request.Email, ct);
        return Ok(new { message = "If the email exists, a reset link has been sent." });
    }

    [HttpPost("reset-password")]
    public async Task<ActionResult> ResetPassword([FromBody] ResetPasswordRequest request, CancellationToken ct)
    {
        var ok = await _auth.ResetPasswordAsync(request, ct);
        if (!ok)
            return BadRequest(new { message = "Invalid or expired reset link." });
        return Ok(new { message = "Password has been reset." });
    }
}
