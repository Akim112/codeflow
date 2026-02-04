namespace CodeFlow.Api.Services;

public interface ISubmissionQueue
{
    ValueTask EnqueueAsync(Guid submissionId, CancellationToken ct = default);
    ValueTask<Guid?> DequeueAsync(CancellationToken ct = default);
}
