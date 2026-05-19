using System.ComponentModel.DataAnnotations;

namespace CodeFlow.Api.DTOs;

public record SubmitCodeRequest([Required, MinLength(1)] string Code, bool WasCleanRun = true);

public record SubmitResultDto(
    bool Passed,
    string Output,
    string? Expected,
    string? Error,
    string? FailureReason,
    int? XpEarned,
    bool LessonCompleted,
    int? TotalXp
);

/// <summary>Ответ при асинхронной отправке кода: идентификатор задачи для опроса статуса.</summary>
public record SubmitAsyncResponse(Guid JobId);

/// <summary>Статус фоновой задачи проверки кода.</summary>
public record SubmissionStatusDto(
    Guid Id,
    string Status,
    string? Output,
    string? Error,
    bool? Passed,
    DateTime CreatedAtUtc,
    DateTime? CompletedAtUtc
);
