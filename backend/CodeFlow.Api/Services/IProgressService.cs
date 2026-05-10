using CodeFlow.Api.DTOs;

namespace CodeFlow.Api.Services;

public interface IProgressService
{
    Task<UserProgressSummaryDto?> GetProgressAsync(Guid userId, CancellationToken ct = default);
    Task<ProgressDto?> CompleteLessonAsync(Guid userId, CompleteLessonRequest request, CancellationToken ct = default);
    Task<XpBalanceDto?> PurchaseHintAsync(Guid userId, PurchaseHintRequest request, CancellationToken ct = default);
    Task<XpBalanceDto?> ApplyMoralChoiceAsync(Guid userId, MoralChoiceRequest request, CancellationToken ct = default);
    Task<bool> ResetProgressAsync(Guid userId, CancellationToken ct = default);
}
