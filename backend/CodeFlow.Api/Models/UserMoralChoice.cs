namespace CodeFlow.Api.Models;

public class UserMoralChoice
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public int LessonId { get; set; }
    public Lesson Lesson { get; set; } = null!;
    public string FactionId { get; set; } = string.Empty;
    public DateTime ChosenAtUtc { get; set; }
}
