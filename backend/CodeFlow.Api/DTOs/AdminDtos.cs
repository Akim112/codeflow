using System.ComponentModel.DataAnnotations;

namespace CodeFlow.Api.DTOs;

public record CreateCourseRequest(
    [Required, MinLength(1), MaxLength(200)] string Title,
    [Required, MinLength(1)] string Description,
    [MaxLength(100)] string Level,
    [MaxLength(50)] string Color,
    int TotalLessons
);

public record UpdateCourseRequest(
    [MinLength(1), MaxLength(200)] string? Title,
    [MinLength(1)] string? Description,
    [MaxLength(100)] string? Level,
    [MaxLength(50)] string? Color,
    int? TotalLessons
);

public record CreateLessonRequest(
    [Required] int CourseId,
    [Required, MinLength(1)] string Chapter,
    [Required, MinLength(1)] string Title,
    [Required] string Description,
    [Required] string Task,
    [Required] string InitialCode,
    [Required] string ExpectedOutput,
    int Xp,
    bool IsBoss,
    bool HasDebugger,
    [Required] string Hint,
    [Required] string Hint2
);

public record UpdateLessonRequest(
    int? CourseId,
    string? Chapter,
    string? Title,
    string? Description,
    string? Task,
    string? InitialCode,
    string? ExpectedOutput,
    int? Xp,
    bool? IsBoss,
    bool? HasDebugger,
    string? Hint,
    string? Hint2
);

public record SetUserRoleRequest([Required] string Role);

public record AdminUserDto(
    Guid Id,
    string Email,
    string DisplayName,
    string Role,
    int TotalXp,
    DateTime CreatedAtUtc,
    bool EmailConfirmed
);
