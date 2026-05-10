namespace CodeFlow.Api.DTOs;

public record CompleteLessonRequest(int LessonId, bool WasCleanRun);
public record PurchaseHintRequest(int Price);
public record MoralChoiceRequest(string FactionId, int XpBonus, int ReputationBonus);
public record ProgressDto(int LessonId, DateTime CompletedAtUtc, int XpEarned, bool WasCleanRun);
public record XpBalanceDto(int TotalXp);
public record UserProgressSummaryDto(
    int TotalXp,
    int CompletedLessonsCount,
    IReadOnlyList<int> CompletedLessonIds,
    int CleanStreak,
    bool FastBossKill
);
