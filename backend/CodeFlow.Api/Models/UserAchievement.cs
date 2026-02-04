namespace CodeFlow.Api.Models;

public class UserAchievement
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public string AchievementId { get; set; } = string.Empty;
    public AchievementDefinition Achievement { get; set; } = null!;
    public DateTime UnlockedAtUtc { get; set; }
}
