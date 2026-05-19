namespace CodeFlow.Api.DTOs;

public record CourseDto(int Id, string Title, string Description, string Level, string Color, int TotalLessons);

/// <summary>Урок для клиента: без эталонного ответа и подсказок (подсказки — через API покупки).</summary>
public record LessonClientDto(
    int Id,
    int CourseId,
    string Chapter,
    string Title,
    string Description,
    string Task,
    string InitialCode,
    int Xp,
    bool IsBoss,
    bool HasDebugger
);

/// <summary>Полные данные урока для преподавателя и администратора.</summary>
public record LessonAdminDto(
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
