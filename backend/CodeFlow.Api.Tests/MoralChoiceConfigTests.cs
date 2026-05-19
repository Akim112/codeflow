using CodeFlow.Api.Config;

namespace CodeFlow.Api.Tests;

public class MoralChoiceConfigTests
{
    [Theory]
    [InlineData("Глава 1: Сигнал", "data_brokers", 500, 50)]
    [InlineData("Глава 2: Логика", "ai_ethicists", 400, 50)]
    [InlineData("Глава 5: Функции", "ghost_protocol", 400, 50)]
    public void TryGetRewards_ReturnsChapterValues(string chapter, string faction, int expectedXp, int expectedRep)
    {
        var ok = MoralChoiceConfig.TryGetRewards(chapter, faction, out var xp, out var rep);

        Assert.True(ok);
        Assert.Equal(expectedXp, xp);
        Assert.Equal(expectedRep, rep);
    }

    [Fact]
    public void TryGetRewards_UnknownFaction_ReturnsFalse()
    {
        var ok = MoralChoiceConfig.TryGetRewards("Глава 1: Сигнал", "unknown_faction", out _, out _);

        Assert.False(ok);
    }

    [Fact]
    public void TryGetRewards_UnknownChapter_UsesFactionDefaults()
    {
        var ok = MoralChoiceConfig.TryGetRewards("Неизвестная глава", "ghost_protocol", out var xp, out var rep);

        Assert.True(ok);
        Assert.Equal(100, xp);
        Assert.Equal(50, rep);
    }
}
