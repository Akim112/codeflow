namespace CodeFlow.Api.Models;

public class Lesson
{
    public int Id { get; set; }
    public int CourseId { get; set; }
    public Course Course { get; set; } = null!;

    public string Chapter { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Task { get; set; } = string.Empty;
    public string InitialCode { get; set; } = string.Empty;
    public string ExpectedOutput { get; set; } = string.Empty;
    public int Xp { get; set; }
    public bool IsBoss { get; set; }
    public bool HasDebugger { get; set; }
    public string Hint { get; set; } = string.Empty;
    public string Hint2 { get; set; } = string.Empty;
}
