namespace CodeFlow.Api.DTOs;

public record AchievementDefinitionDto(string Id, string Title, string Description, string Icon, string Rarity);
public record UserAchievementDto(string AchievementId, DateTime UnlockedAtUtc);
