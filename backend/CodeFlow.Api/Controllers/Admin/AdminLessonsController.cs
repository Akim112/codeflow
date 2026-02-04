using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CodeFlow.Api.Data;
using CodeFlow.Api.DTOs;
using CodeFlow.Api.Models;

namespace CodeFlow.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/lessons")]
[Authorize(Policy = "AdminOrTeacher")]
public class AdminLessonsController : ControllerBase
{
    private readonly AppDbContext _db;

    public AdminLessonsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<LessonDto>>> GetAll([FromQuery] int? courseId, CancellationToken ct)
    {
        var query = _db.Lessons.AsQueryable();
        if (courseId.HasValue)
            query = query.Where(l => l.CourseId == courseId.Value);
        var list = await query
            .OrderBy(l => l.CourseId).ThenBy(l => l.Id)
            .Select(l => new LessonDto(l.Id, l.CourseId, l.Chapter, l.Title, l.Description, l.Task, l.InitialCode, l.ExpectedOutput, l.Xp, l.IsBoss, l.HasDebugger, l.Hint, l.Hint2))
            .ToListAsync(ct);
        return Ok(list);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<LessonDto>> GetById(int id, CancellationToken ct)
    {
        var lesson = await _db.Lessons.Include(l => l.Course).FirstOrDefaultAsync(l => l.Id == id, ct);
        if (lesson == null) return NotFound();
        return Ok(new LessonDto(lesson.Id, lesson.CourseId, lesson.Chapter, lesson.Title, lesson.Description, lesson.Task, lesson.InitialCode, lesson.ExpectedOutput, lesson.Xp, lesson.IsBoss, lesson.HasDebugger, lesson.Hint, lesson.Hint2));
    }

    [HttpPost]
    public async Task<ActionResult<LessonDto>> Create([FromBody] CreateLessonRequest request, CancellationToken ct)
    {
        var courseExists = await _db.Courses.AnyAsync(c => c.Id == request.CourseId, ct);
        if (!courseExists) return BadRequest(new { message = "Course not found." });
        var id = await _db.Lessons.AnyAsync(ct) ? await _db.Lessons.MaxAsync(l => l.Id, ct) + 1 : 1;
        var lesson = new Lesson
        {
            Id = id,
            CourseId = request.CourseId,
            Chapter = request.Chapter,
            Title = request.Title,
            Description = request.Description,
            Task = request.Task,
            InitialCode = request.InitialCode,
            ExpectedOutput = request.ExpectedOutput,
            Xp = request.Xp,
            IsBoss = request.IsBoss,
            HasDebugger = request.HasDebugger,
            Hint = request.Hint,
            Hint2 = request.Hint2
        };
        _db.Lessons.Add(lesson);
        await _db.SaveChangesAsync(ct);
        return CreatedAtAction(nameof(GetById), new { id = lesson.Id }, new LessonDto(lesson.Id, lesson.CourseId, lesson.Chapter, lesson.Title, lesson.Description, lesson.Task, lesson.InitialCode, lesson.ExpectedOutput, lesson.Xp, lesson.IsBoss, lesson.HasDebugger, lesson.Hint, lesson.Hint2));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<LessonDto>> Update(int id, [FromBody] UpdateLessonRequest request, CancellationToken ct)
    {
        var lesson = await _db.Lessons.FindAsync(new object[] { id }, ct);
        if (lesson == null) return NotFound();
        if (request.CourseId.HasValue) lesson.CourseId = request.CourseId.Value;
        if (request.Chapter != null) lesson.Chapter = request.Chapter;
        if (request.Title != null) lesson.Title = request.Title;
        if (request.Description != null) lesson.Description = request.Description;
        if (request.Task != null) lesson.Task = request.Task;
        if (request.InitialCode != null) lesson.InitialCode = request.InitialCode;
        if (request.ExpectedOutput != null) lesson.ExpectedOutput = request.ExpectedOutput;
        if (request.Xp.HasValue) lesson.Xp = request.Xp.Value;
        if (request.IsBoss.HasValue) lesson.IsBoss = request.IsBoss.Value;
        if (request.HasDebugger.HasValue) lesson.HasDebugger = request.HasDebugger.Value;
        if (request.Hint != null) lesson.Hint = request.Hint;
        if (request.Hint2 != null) lesson.Hint2 = request.Hint2;
        await _db.SaveChangesAsync(ct);
        return Ok(new LessonDto(lesson.Id, lesson.CourseId, lesson.Chapter, lesson.Title, lesson.Description, lesson.Task, lesson.InitialCode, lesson.ExpectedOutput, lesson.Xp, lesson.IsBoss, lesson.HasDebugger, lesson.Hint, lesson.Hint2));
    }

    [HttpDelete("{id:int}")]
    public async Task<ActionResult> Delete(int id, CancellationToken ct)
    {
        var lesson = await _db.Lessons.FindAsync(new object[] { id }, ct);
        if (lesson == null) return NotFound();
        _db.Lessons.Remove(lesson);
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }
}
