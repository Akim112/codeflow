namespace CodeFlow.Api.Models;

public class UserNotification
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public string Type { get; set; } = "info"; // achievement, lesson_complete, system
    public string Title { get; set; } = string.Empty;
    public string? Body { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public bool IsRead { get; set; }
}
