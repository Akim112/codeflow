namespace CodeFlow.Api.Services;

/// <summary>
/// Заглушка для отправки email.
/// </summary>
public interface IEmailStubService
{
    Task SendEmailConfirmationAsync(string email, string displayName, string confirmationLink, CancellationToken ct = default);
    Task SendPasswordResetAsync(string email, string resetLink, CancellationToken ct = default);
}
