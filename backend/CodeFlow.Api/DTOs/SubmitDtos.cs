using System.ComponentModel.DataAnnotations;

namespace CodeFlow.Api.DTOs;

public record SubmitCodeRequest([Required, MinLength(1)] string Code);

public record SubmitResultDto(
    bool Passed,
    string Output,
    string Expected,
    string? Error,
    string? FailureReason
);

/// <summary> Ответ при асинхронной отправке кода: id задачи для опроса статуса. </summary>
public record SubmitAsyncResponse(Guid JobId);

/// <summary> Статус задачи проверки кода. </summary>
public record SubmissionStatusDto(
    Guid Id,
    string Status,
    string? Output,
    string? Error,
    bool? Passed,
    DateTime CreatedAtUtc,
    DateTime? CompletedAtUtc
);
