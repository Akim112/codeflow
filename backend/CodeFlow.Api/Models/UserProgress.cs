namespace CodeFlow.Api.Models;

public class UserProgress
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public int LessonId { get; set; }
    public Lesson Lesson { get; set; } = null!;
    public DateTime CompletedAtUtc { get; set; }
    public int XpEarned { get; set; }
    public bool WasCleanRun { get; set; }
}
