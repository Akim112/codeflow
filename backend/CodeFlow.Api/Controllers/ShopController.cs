using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CodeFlow.Api.Data;
using CodeFlow.Api.DTOs;
using CodeFlow.Api.Models;

namespace CodeFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ShopController : ControllerBase
{
    private readonly AppDbContext _db;

    public ShopController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet("items")]
    public async Task<ActionResult<IEnumerable<ShopItemDto>>> GetItems(CancellationToken ct)
    {
        var list = await _db.ShopItems
            .Select(s => new ShopItemDto(s.Id, s.Name, s.Color, s.Bg, s.Price))
            .ToListAsync(ct);
        return Ok(list);
    }

    [HttpPost("purchase")]
    [Authorize]
    public async Task<ActionResult<ShopItemDto>> Purchase([FromBody] PurchaseRequest request, CancellationToken ct)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userIdStr == null || !Guid.TryParse(userIdStr, out var userId))
            return Unauthorized();

        var user = await _db.Users
            .Include(u => u.OwnedShopItems)
            .FirstOrDefaultAsync(u => u.Id == userId, ct);
        var item = await _db.ShopItems.FindAsync(new object[] { request.ShopItemId }, ct);
        if (user == null || item == null) return NotFound();
        if (user.OwnedShopItems.Any(o => o.ShopItemId == request.ShopItemId))
            return BadRequest(new { message = "Already owned." });
        if (user.TotalXp < item.Price)
            return BadRequest(new { message = "Not enough XP." });

        user.TotalXp -= item.Price;
        user.OwnedShopItems.Add(new UserShopItem
        {
            UserId = userId,
            ShopItemId = item.Id,
            PurchasedAtUtc = DateTime.UtcNow
        });
        await _db.SaveChangesAsync(ct);

        return Ok(new ShopItemDto(item.Id, item.Name, item.Color, item.Bg, item.Price));
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<ShopItemDto>>> GetMyItems(CancellationToken ct)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userIdStr == null || !Guid.TryParse(userIdStr, out var userId))
            return Unauthorized();
        var list = await _db.UserShopItems
            .Where(o => o.UserId == userId)
            .Include(o => o.ShopItem)
            .Select(o => new ShopItemDto(o.ShopItem.Id, o.ShopItem.Name, o.ShopItem.Color, o.ShopItem.Bg, o.ShopItem.Price))
            .ToListAsync(ct);
        return Ok(list);
    }
}
