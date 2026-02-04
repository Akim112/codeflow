namespace CodeFlow.Api.Services;

/// <summary>
/// Заглушка: логирует ссылки в консоль вместо отправки писем.
/// Позже замена на реальный SMTP
/// </summary>
public class EmailStubService : IEmailStubService
{
    private readonly ILogger<EmailStubService> _logger;

    public EmailStubService(ILogger<EmailStubService> logger)
    {
        _logger = logger;
    }

    public Task SendEmailConfirmationAsync(string email, string displayName, string confirmationLink, CancellationToken ct = default)
    {
        _logger.LogInformation("[STUB] Email confirmation for {Email} ({DisplayName}). Link: {Link}", email, displayName, confirmationLink);
        return Task.CompletedTask;
    }

    public Task SendPasswordResetAsync(string email, string resetLink, CancellationToken ct = default)
    {
        _logger.LogInformation("[STUB] Password reset for {Email}. Link: {Link}", email, resetLink);
        return Task.CompletedTask;
    }
}
