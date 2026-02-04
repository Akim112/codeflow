using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CodeFlow.Api.DTOs;
using CodeFlow.Api.Services;

namespace CodeFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    private Guid? UserId => Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : null;

    [HttpGet("me")]
    public async Task<ActionResult<UserDto>> GetMe(CancellationToken ct)
    {
        var userId = UserId;
        if (userId == null) return Unauthorized();
        var user = await _userService.GetByIdAsync(userId.Value, ct);
        if (user == null) return NotFound();
        return Ok(user);
    }

    [HttpPatch("me")]
    public async Task<ActionResult<UserDto>> UpdateMe([FromBody] UpdateProfileRequest? request, CancellationToken ct)
    {
        var userId = UserId;
        if (userId == null) return Unauthorized();
        var user = await _userService.UpdateProfileAsync(userId.Value, request?.DisplayName, ct);
        if (user == null) return NotFound();
        return Ok(user);
    }
}

public record UpdateProfileRequest(string? DisplayName);
