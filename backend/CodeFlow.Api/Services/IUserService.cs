using CodeFlow.Api.DTOs;

namespace CodeFlow.Api.Services;

public interface IUserService
{
    Task<UserDto?> GetByIdAsync(Guid userId, CancellationToken ct = default);
    Task<UserDto?> UpdateProfileAsync(Guid userId, string? displayName, CancellationToken ct = default);
}
