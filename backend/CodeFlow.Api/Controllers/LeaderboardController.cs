using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CodeFlow.Api.Data;
using CodeFlow.Api.DTOs;

namespace CodeFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LeaderboardController : ControllerBase
{
    private readonly AppDbContext _db;

    public LeaderboardController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<LeaderboardEntryDto>>> Get([FromQuery] int limit = 50, CancellationToken ct = default)
    {
        if (limit <= 0 || limit > 100) limit = 50;
        var users = await _db.Users
            .OrderByDescending(u => u.TotalXp)
            .Take(limit)
            .Select(u => new { u.Id, u.DisplayName, u.TotalXp })
            .ToListAsync(ct);
        var list = users.Select((u, i) => new LeaderboardEntryDto(i + 1, u.Id, u.DisplayName, u.TotalXp)).ToList();
        return Ok(list);
    }
}
