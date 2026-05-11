namespace CodeFlow.Api.Tests;

/// <summary>
/// Проверка нормализации вывода при сравнении с эталоном (как в LessonsController).
/// </summary>
public class LessonSubmitLogicTests
{
    [Theory]
    [InlineData("hello\r\nworld", "hello\nworld")]
    [InlineData("line\r\n", "line")]
    [InlineData("", "")]
    public void NormalizeOutput_MatchesControllerBehavior(string input, string expected)
    {
        var normalized = NormalizeOutput(input);
        Assert.Equal(expected, normalized);
    }

    [Fact]
    public void CompareOutputs_TrimmedAndUnifiedLineEndings()
    {
        const string actual = "OK\r\n";
        const string expected = "OK";
        Assert.Equal(NormalizeOutput(expected), NormalizeOutput(actual));
    }

    private static string NormalizeOutput(string s)
    {
        if (string.IsNullOrEmpty(s)) return "";
        return s.TrimEnd().Replace("\r\n", "\n").Replace("\r", "\n");
    }
}
