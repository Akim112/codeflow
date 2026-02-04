using CodeFlow.Api.DTOs;

namespace CodeFlow.Api.Services;

public interface IAuthService
{
    Task<AuthResponse?> RegisterAsync(RegisterRequest request, CancellationToken ct = default);
    Task<AuthResponse?> LoginAsync(LoginRequest request, CancellationToken ct = default);
    Task<bool> ConfirmEmailAsync(string email, string token, CancellationToken ct = default);
    Task<bool> RequestPasswordResetAsync(string email, CancellationToken ct = default);
    Task<bool> ResetPasswordAsync(ResetPasswordRequest request, CancellationToken ct = default);
}
