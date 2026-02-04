namespace CodeFlow.Api.DTOs;

public record CourseDto(int Id, string Title, string Description, string Level, string Color, int TotalLessons);
public record LessonDto(
    int Id,
    int CourseId,
    string Chapter,
    string Title,
    string Description,
    string Task,
    string InitialCode,
    string ExpectedOutput,
    int Xp,
    bool IsBoss,
    bool HasDebugger,
    string Hint,
    string Hint2
);
