using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CodeFlow.Api.Data;
using CodeFlow.Api.DTOs;

namespace CodeFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SearchController : ControllerBase
{
    private readonly AppDbContext _db;

    public SearchController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<SearchResultDto>> Search([FromQuery] string? q, [FromQuery] int limit = 20, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(q) || q.Length < 2)
            return Ok(new SearchResultDto(Array.Empty<CourseDto>(), Array.Empty<LessonDto>()));

        if (limit <= 0 || limit > 50) limit = 20;
        var term = $"%{q.Trim()}%";

        var courses = await _db.Courses
            .Where(c => EF.Functions.ILike(c.Title, term) || EF.Functions.ILike(c.Description, term) || EF.Functions.ILike(c.Level, term))
            .Take(limit)
            .Select(c => new CourseDto(c.Id, c.Title, c.Description, c.Level, c.Color, c.TotalLessons))
            .ToListAsync(ct);

        var lessons = await _db.Lessons
            .Where(l => EF.Functions.ILike(l.Title, term) || EF.Functions.ILike(l.Description, term) || EF.Functions.ILike(l.Chapter, term) || EF.Functions.ILike(l.Task, term))
            .Take(limit)
            .Select(l => new LessonDto(l.Id, l.CourseId, l.Chapter, l.Title, l.Description, l.Task, l.InitialCode, l.ExpectedOutput, l.Xp, l.IsBoss, l.HasDebugger, l.Hint, l.Hint2))
            .ToListAsync(ct);

        return Ok(new SearchResultDto(courses, lessons));
    }
}

public record SearchResultDto(IReadOnlyList<CourseDto> Courses, IReadOnlyList<LessonDto> Lessons);
