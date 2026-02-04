using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using CodeFlow.Api.Data;
using CodeFlow.Api.DTOs;
using CodeFlow.Api.Models;

namespace CodeFlow.Api.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;
    private readonly IEmailStubService _emailStub;

    public AuthService(AppDbContext db, IConfiguration config, IEmailStubService emailStub)
    {
        _db = db;
        _config = config;
        _emailStub = emailStub;
    }

    public async Task<AuthResponse?> RegisterAsync(RegisterRequest request, CancellationToken ct = default)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 6)
            return null;

        if (await _db.Users.AnyAsync(u => u.Email == email, ct))
            return null;

        var hash = BCrypt.Net.BCrypt.HashPassword(request.Password, workFactor: 10);
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = email,
            PasswordHash = hash,
            DisplayName = string.IsNullOrWhiteSpace(request.DisplayName) ? email : request.DisplayName.Trim(),
            CreatedAtUtc = DateTime.UtcNow,
            TotalXp = 0
        };

        var confirmationToken = Guid.NewGuid().ToString("N");
        user.EmailConfirmationToken = confirmationToken;
        _db.Users.Add(user);
        await _db.SaveChangesAsync(ct);

        var baseUrl = _config["App:BaseUrl"] ?? "http://localhost:5173";
        var link = $"{baseUrl}/confirm-email?token={confirmationToken}&email={Uri.EscapeDataString(email)}";
        await _emailStub.SendEmailConfirmationAsync(user.Email, user.DisplayName, link, ct);

        return BuildAuthResponse(user);
    }

    public async Task<AuthResponse?> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email, ct);
        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return null;

        return BuildAuthResponse(user);
    }

    private AuthResponse BuildAuthResponse(User user)
    {
        var key = _config["Jwt:Key"] ?? "CodeFlow-SuperSecretKey-Min32Chars!!";
        var issuer = _config["Jwt:Issuer"] ?? "CodeFlow.Api";
        var expMinutes = int.TryParse(_config["Jwt:ExpirationMinutes"], out var m) ? m : 10080;

        var tokenHandler = new JwtSecurityTokenHandler();
        var keyBytes = Encoding.UTF8.GetBytes(key);
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.DisplayName),
                new Claim(ClaimTypes.Role, user.Role)
            }),
            Expires = DateTime.UtcNow.AddMinutes(expMinutes),
            Issuer = issuer,
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(keyBytes), SecurityAlgorithms.HmacSha256Signature)
        };
        var token = tokenHandler.CreateToken(tokenDescriptor);
        var jwt = tokenHandler.WriteToken(token);

        var userDto = new UserDto(
            user.Id,
            user.Email,
            user.DisplayName,
            user.TotalXp,
            user.CreatedAtUtc,
            user.EmailConfirmedAtUtc.HasValue,
            user.Role
        );

        return new AuthResponse(jwt, "Bearer", expMinutes * 60, userDto);
    }

    public async Task<bool> ConfirmEmailAsync(string email, string token, CancellationToken ct = default)
    {
        var normalizedEmail = email.Trim().ToLowerInvariant();
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail, ct);
        if (user == null || user.EmailConfirmationToken != token || string.IsNullOrEmpty(token))
            return false;
        user.EmailConfirmedAtUtc = DateTime.UtcNow;
        user.EmailConfirmationToken = null;
        await _db.SaveChangesAsync(ct);
        return true;
    }

    public async Task<bool> RequestPasswordResetAsync(string email, CancellationToken ct = default)
    {
        var normalizedEmail = email.Trim().ToLowerInvariant();
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail, ct);
        if (user == null)
            return true;

        var token = Guid.NewGuid().ToString("N");
        user.PasswordResetToken = token;
        user.PasswordResetTokenExpiresAtUtc = DateTime.UtcNow.AddHours(1);
        await _db.SaveChangesAsync(ct);

        var baseUrl = _config["App:BaseUrl"] ?? "http://localhost:5173";
        var link = $"{baseUrl}/reset-password?token={Uri.EscapeDataString(token)}&email={Uri.EscapeDataString(normalizedEmail)}";
        await _emailStub.SendPasswordResetAsync(user.Email, link, ct);
        return true;
    }

    public async Task<bool> ResetPasswordAsync(ResetPasswordRequest request, CancellationToken ct = default)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail, ct);
        if (user == null || user.PasswordResetToken != request.Token || string.IsNullOrEmpty(request.Token))
            return false;
        if (user.PasswordResetTokenExpiresAtUtc == null || user.PasswordResetTokenExpiresAtUtc < DateTime.UtcNow)
            return false;

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword, workFactor: 10);
        user.PasswordResetToken = null;
        user.PasswordResetTokenExpiresAtUtc = null;
        await _db.SaveChangesAsync(ct);
        return true;
    }
}
