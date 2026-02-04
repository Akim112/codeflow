using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CodeFlow.Api.Data;
using CodeFlow.Api.Models;

namespace CodeFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly AppDbContext _db;

    public NotificationsController(AppDbContext db)
    {
        _db = db;
    }

    private Guid? UserId => Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : null;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<NotificationDto>>> GetMy([FromQuery] bool unreadOnly = false, [FromQuery] int limit = 50, CancellationToken ct = default)
    {
        var userId = UserId;
        if (userId == null) return Unauthorized();
        if (limit <= 0 || limit > 100) limit = 50;

        var query = _db.UserNotifications.Where(n => n.UserId == userId.Value);
        if (unreadOnly) query = query.Where(n => !n.IsRead);
        var list = await query
            .OrderByDescending(n => n.CreatedAtUtc)
            .Take(limit)
            .Select(n => new NotificationDto(n.Id, n.Type, n.Title, n.Body, n.CreatedAtUtc, n.IsRead))
            .ToListAsync(ct);
        return Ok(list);
    }

    [HttpPatch("{id:guid}/read")]
    public async Task<ActionResult> MarkRead(Guid id, CancellationToken ct)
    {
        var userId = UserId;
        if (userId == null) return Unauthorized();
        var n = await _db.UserNotifications.FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId.Value, ct);
        if (n == null) return NotFound();
        n.IsRead = true;
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpPost("read-all")]
    public async Task<ActionResult> MarkAllRead(CancellationToken ct)
    {
        var userId = UserId;
        if (userId == null) return Unauthorized();
        await _db.UserNotifications.Where(n => n.UserId == userId.Value && !n.IsRead).ExecuteUpdateAsync(s => s.SetProperty(n => n.IsRead, true), ct);
        return NoContent();
    }
}

public record NotificationDto(Guid Id, string Type, string Title, string? Body, DateTime CreatedAtUtc, bool IsRead);
