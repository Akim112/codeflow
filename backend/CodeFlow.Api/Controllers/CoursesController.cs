using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CodeFlow.Api.Data;
using CodeFlow.Api.DTOs;

namespace CodeFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CoursesController : ControllerBase
{
    private readonly AppDbContext _db;

    public CoursesController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CourseDto>>> GetAll(CancellationToken ct)
    {
        var list = await _db.Courses
            .Select(c => new CourseDto(c.Id, c.Title, c.Description, c.Level, c.Color, c.TotalLessons))
            .ToListAsync(ct);
        return Ok(list);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<CourseDto>> GetById(int id, CancellationToken ct)
    {
        var course = await _db.Courses.FindAsync(new object[] { id }, ct);
        if (course == null) return NotFound();
        return Ok(new CourseDto(course.Id, course.Title, course.Description, course.Level, course.Color, course.TotalLessons));
    }

    [HttpGet("{id:int}/lessons")]
    public async Task<ActionResult<IEnumerable<LessonDto>>> GetLessons(int id, CancellationToken ct)
    {
        var lessons = await _db.Lessons
            .Where(l => l.CourseId == id)
            .OrderBy(l => l.Id)
            .Select(l => new LessonDto(l.Id, l.CourseId, l.Chapter, l.Title, l.Description, l.Task, l.InitialCode, l.ExpectedOutput, l.Xp, l.IsBoss, l.HasDebugger, l.Hint, l.Hint2))
            .ToListAsync(ct);
        return Ok(lessons);
    }
}
