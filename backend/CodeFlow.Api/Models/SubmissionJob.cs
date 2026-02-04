namespace CodeFlow.Api.Models;

public class SubmissionJob
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public int LessonId { get; set; }
    public Lesson Lesson { get; set; } = null!;

    public string Code { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending"; // Pending, Running, Completed, Failed
    public string? Output { get; set; }
    public string? Error { get; set; }
    public bool? Passed { get; set; }

    public DateTime CreatedAtUtc { get; set; }
    public DateTime? CompletedAtUtc { get; set; }
}
