namespace CodeFlow.Api.DTOs;

public record LeaderboardEntryDto(int Rank, Guid UserId, string DisplayName, int TotalXp);
