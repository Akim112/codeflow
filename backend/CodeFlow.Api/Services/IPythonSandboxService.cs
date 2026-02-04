namespace CodeFlow.Api.Services;

public record RunResult(bool Success, string Output, string? Error, int? ExitCode, string? FailureReason);

public interface IPythonSandboxService
{
    Task<RunResult> RunAsync(string code, TimeSpan? timeout = null, CancellationToken ct = default);
}
