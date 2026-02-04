namespace CodeFlow.Api.DTOs;

public record FactionDto(string Id, string Name, string Description, string Icon, string Color, string Bonus, int RequiredRep);
public record UserReputationDto(string FactionId, int Reputation);
