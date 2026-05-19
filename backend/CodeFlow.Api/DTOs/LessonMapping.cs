using CodeFlow.Api.Models;

namespace CodeFlow.Api.DTOs;

public static class LessonMapping
{
    public static LessonClientDto ToClientDto(this Lesson lesson) =>
        new(
            lesson.Id,
            lesson.CourseId,
            lesson.Chapter,
            lesson.Title,
            lesson.Description,
            lesson.Task,
            lesson.InitialCode,
            lesson.Xp,
            lesson.IsBoss,
            lesson.HasDebugger
        );

    public static LessonAdminDto ToAdminDto(this Lesson lesson) =>
        new(
            lesson.Id,
            lesson.CourseId,
            lesson.Chapter,
            lesson.Title,
            lesson.Description,
            lesson.Task,
            lesson.InitialCode,
            lesson.ExpectedOutput,
            lesson.Xp,
            lesson.IsBoss,
            lesson.HasDebugger,
            lesson.Hint,
            lesson.Hint2
        );
}
