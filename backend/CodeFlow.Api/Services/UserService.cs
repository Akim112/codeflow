using Microsoft.EntityFrameworkCore;
using CodeFlow.Api.Data;
using CodeFlow.Api.DTOs;
using CodeFlow.Api.Models;

namespace CodeFlow.Api.Services;

public class UserService : IUserService
{
    private readonly AppDbContext _db;

    public UserService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<UserDto?> GetByIdAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await _db.Users.FindAsync(new object[] { userId }, ct);
        return user == null ? null : ToDto(user);
    }

    public async Task<UserDto?> UpdateProfileAsync(Guid userId, string? displayName, CancellationToken ct = default)
    {
        var user = await _db.Users.FindAsync(new object[] { userId }, ct);
        if (user == null) return null;
        if (!string.IsNullOrWhiteSpace(displayName))
            user.DisplayName = displayName.Trim();
        await _db.SaveChangesAsync(ct);
        return ToDto(user);
    }

    private static UserDto ToDto(User u) => new(
        u.Id,
        u.Email,
        u.DisplayName,
        u.TotalXp,
        u.CreatedAtUtc,
        u.EmailConfirmedAtUtc.HasValue,
        u.Role
    );
}
