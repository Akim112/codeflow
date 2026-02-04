using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CodeFlow.Api.Data;
using CodeFlow.Api.DTOs;
using CodeFlow.Api.Models;

namespace CodeFlow.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/users")]
[Authorize(Policy = "Admin")]
public class AdminUsersController : ControllerBase
{
    private readonly AppDbContext _db;

    public AdminUsersController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<AdminUserDto>>> GetAll([FromQuery] int skip = 0, [FromQuery] int take = 50, CancellationToken ct = default)
    {
        if (take <= 0 || take > 100) take = 50;
        var list = await _db.Users
            .OrderBy(u => u.CreatedAtUtc)
            .Skip(skip)
            .Take(take)
            .Select(u => new AdminUserDto(u.Id, u.Email, u.DisplayName, u.Role, u.TotalXp, u.CreatedAtUtc, u.EmailConfirmedAtUtc.HasValue))
            .ToListAsync(ct);
        return Ok(list);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<AdminUserDto>> GetById(Guid id, CancellationToken ct)
    {
        var user = await _db.Users.FindAsync(new object[] { id }, ct);
        if (user == null) return NotFound();
        return Ok(new AdminUserDto(user.Id, user.Email, user.DisplayName, user.Role, user.TotalXp, user.CreatedAtUtc, user.EmailConfirmedAtUtc.HasValue));
    }

    [HttpPatch("{id:guid}/role")]
    public async Task<ActionResult<AdminUserDto>> SetRole(Guid id, [FromBody] SetUserRoleRequest request, CancellationToken ct)
    {
        var role = request.Role?.Trim();
        if (string.IsNullOrEmpty(role) || !Role.All.Contains(role))
            return BadRequest(new { message = "Role must be one of: User, Teacher, Admin." });
        var user = await _db.Users.FindAsync(new object[] { id }, ct);
        if (user == null) return NotFound();
        user.Role = role;
        await _db.SaveChangesAsync(ct);
        return Ok(new AdminUserDto(user.Id, user.Email, user.DisplayName, user.Role, user.TotalXp, user.CreatedAtUtc, user.EmailConfirmedAtUtc.HasValue));
    }
}
