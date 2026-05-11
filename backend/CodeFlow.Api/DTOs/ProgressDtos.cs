namespace CodeFlow.Api.DTOs;

public record CompleteLessonRequest(int LessonId, bool WasCleanRun);
public record PurchaseHintRequest(int LessonId, int HintLevel);
public record MoralChoiceRequest(string FactionId, int LessonId);
public record ProgressDto(int LessonId, DateTime CompletedAtUtc, int XpEarned, bool WasCleanRun);
public record XpBalanceDto(int TotalXp);
public record PurchaseHintResponseDto(int TotalXp, int HintLevel, string HintText);
public record UserProgressSummaryDto(
    int TotalXp,
    int CompletedLessonsCount,
    IReadOnlyList<int> CompletedLessonIds,
    int CleanStreak,
    bool FastBossKill
);
