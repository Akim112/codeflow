using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CodeFlow.Api.Data;
using CodeFlow.Api.DTOs;

namespace CodeFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FactionsController : ControllerBase
{
    private readonly AppDbContext _db;

    public FactionsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<FactionDto>>> GetAll(CancellationToken ct)
    {
        var list = await _db.Factions
            .Select(f => new FactionDto(f.Id, f.Name, f.Description, f.Icon, f.Color, f.Bonus, f.RequiredRep))
            .ToListAsync(ct);
        return Ok(list);
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<UserReputationDto>>> GetMyReputation(CancellationToken ct)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userIdStr == null || !Guid.TryParse(userIdStr, out var userId))
            return Unauthorized();
        var list = await _db.UserReputations
            .Where(r => r.UserId == userId)
            .Select(r => new UserReputationDto(r.FactionId, r.Reputation))
            .ToListAsync(ct);
        return Ok(list);
    }
}
