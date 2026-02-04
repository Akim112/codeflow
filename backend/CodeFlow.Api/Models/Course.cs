namespace CodeFlow.Api.Models;

public class Course
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Level { get; set; } = string.Empty;
    public string Color { get; set; } = "green";
    public int TotalLessons { get; set; }

    public ICollection<Lesson> Lessons { get; set; } = new List<Lesson>();
}
