using CodeFlow.Api.DTOs;

namespace CodeFlow.Api.Services;

public interface IProgressService
{
    Task<UserProgressSummaryDto?> GetProgressAsync(Guid userId, CancellationToken ct = default);
    Task<ProgressDto?> CompleteLessonAsync(Guid userId, CompleteLessonRequest request, CancellationToken ct = default);
}
