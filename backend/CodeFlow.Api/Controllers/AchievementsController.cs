using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CodeFlow.Api.Data;
using CodeFlow.Api.DTOs;

namespace CodeFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AchievementsController : ControllerBase
{
    private readonly AppDbContext _db;

    public AchievementsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<AchievementDefinitionDto>>> GetAll(CancellationToken ct)
    {
        var list = await _db.AchievementDefinitions
            .Select(a => new AchievementDefinitionDto(a.Id, a.Title, a.Description, a.Icon, a.Rarity))
            .ToListAsync(ct);
        return Ok(list);
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<UserAchievementDto>>> GetMyAchievements(CancellationToken ct)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userIdStr == null || !Guid.TryParse(userIdStr, out var userId))
            return Unauthorized();
        var list = await _db.UserAchievements
            .Where(a => a.UserId == userId)
            .OrderBy(a => a.UnlockedAtUtc)
            .Select(a => new UserAchievementDto(a.AchievementId, a.UnlockedAtUtc))
            .ToListAsync(ct);
        return Ok(list);
    }
}
