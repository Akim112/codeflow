using System.ComponentModel.DataAnnotations;

namespace CodeFlow.Api.DTOs;

public record RegisterRequest(
    [Required, MinLength(1), EmailAddress] string Email,
    [Required, MinLength(6)] string Password,
    [MaxLength(100)] string? DisplayName
);

public record LoginRequest(
    [Required, MinLength(1)] string Email,
    [Required, MinLength(1)] string Password
);

public record ForgotPasswordRequest([Required, EmailAddress] string Email);

public record ResetPasswordRequest(
    [Required, MinLength(1)] string Token,
    [Required, EmailAddress] string Email,
    [Required, MinLength(6)] string NewPassword
);

public record AuthResponse(string AccessToken, string TokenType, int ExpiresInSeconds, UserDto User);

public record UserDto(
    Guid Id,
    string Email,
    string DisplayName,
    int TotalXp,
    DateTime CreatedAtUtc,
    bool EmailConfirmed,
    string Role
);
