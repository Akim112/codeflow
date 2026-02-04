namespace CodeFlow.Api.Models;

public class Faction
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public string Bonus { get; set; } = string.Empty;
    public int RequiredRep { get; set; }

    public ICollection<UserReputation> UserReputations { get; set; } = new List<UserReputation>();
}
