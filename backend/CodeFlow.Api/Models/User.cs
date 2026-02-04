namespace CodeFlow.Api.Models;

public class User
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; }
    public DateTime? EmailConfirmedAtUtc { get; set; }
    public string? EmailConfirmationToken { get; set; }
    public string? PasswordResetToken { get; set; }
    public DateTime? PasswordResetTokenExpiresAtUtc { get; set; }

    public int TotalXp { get; set; }

    /// <summary> Роль: User, Teacher, Admin. </summary>
    public string Role { get; set; } = "User";

    public ICollection<UserProgress> Progress { get; set; } = new List<UserProgress>();
    public ICollection<UserAchievement> Achievements { get; set; } = new List<UserAchievement>();
    public ICollection<UserReputation> Reputation { get; set; } = new List<UserReputation>();
    public ICollection<UserShopItem> OwnedShopItems { get; set; } = new List<UserShopItem>();
    public ICollection<UserNotification> Notifications { get; set; } = new List<UserNotification>();
    public ICollection<SubmissionJob> SubmissionJobs { get; set; } = new List<SubmissionJob>();
}
