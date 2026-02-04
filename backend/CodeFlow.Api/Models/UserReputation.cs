namespace CodeFlow.Api.Models;

public class UserReputation
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public string FactionId { get; set; } = string.Empty;
    public Faction Faction { get; set; } = null!;
    public int Reputation { get; set; }
}
