namespace CodeFlow.Api.Models;

public class AchievementDefinition
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public string Rarity { get; set; } = "common"; // common, rare, epic, legendary
}
