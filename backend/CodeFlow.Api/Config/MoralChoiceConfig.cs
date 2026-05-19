namespace CodeFlow.Api.Config;

/// <summary>
/// Награды за моральный выбор по главе и фракции (значения задаются на сервере).
/// </summary>
public static class MoralChoiceConfig
{
    private static readonly Dictionary<string, Dictionary<string, (int Xp, int Rep)>> ByChapter =
        new(StringComparer.OrdinalIgnoreCase)
        {
            ["Глава 1: Сигнал"] = new(StringComparer.OrdinalIgnoreCase)
            {
                ["data_brokers"] = (500, 50),
                ["ai_ethicists"] = (300, 50),
                ["ghost_protocol"] = (100, 50),
            },
            ["Глава 2: Логика"] = new(StringComparer.OrdinalIgnoreCase)
            {
                ["data_brokers"] = (600, 50),
                ["ai_ethicists"] = (400, 50),
                ["ghost_protocol"] = (200, 50),
            },
            ["Глава 3: Циклы"] = new(StringComparer.OrdinalIgnoreCase)
            {
                ["data_brokers"] = (700, 50),
                ["ai_ethicists"] = (500, 50),
                ["ghost_protocol"] = (250, 50),
            },
            ["Глава 4: Коллекции"] = new(StringComparer.OrdinalIgnoreCase)
            {
                ["data_brokers"] = (800, 50),
                ["ai_ethicists"] = (600, 50),
                ["ghost_protocol"] = (300, 50),
            },
            ["Глава 5: Функции"] = new(StringComparer.OrdinalIgnoreCase)
            {
                ["data_brokers"] = (1000, 50),
                ["ai_ethicists"] = (800, 50),
                ["ghost_protocol"] = (400, 50),
            },
        };

    private static readonly Dictionary<string, (int Xp, int Rep)> DefaultByFaction =
        new(StringComparer.OrdinalIgnoreCase)
        {
            ["data_brokers"] = (500, 50),
            ["ai_ethicists"] = (300, 50),
            ["ghost_protocol"] = (100, 50),
        };

    public static bool TryGetRewards(string chapter, string factionId, out int xp, out int reputation)
    {
        xp = 0;
        reputation = 0;
        if (string.IsNullOrWhiteSpace(factionId)) return false;

        if (ByChapter.TryGetValue(chapter.Trim(), out var factions) &&
            factions.TryGetValue(factionId.Trim(), out var rewards))
        {
            xp = rewards.Xp;
            reputation = rewards.Rep;
            return true;
        }

        if (DefaultByFaction.TryGetValue(factionId.Trim(), out var fallback))
        {
            xp = fallback.Xp;
            reputation = fallback.Rep;
            return true;
        }

        return false;
    }
}
