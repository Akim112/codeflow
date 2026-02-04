using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CodeFlow.Api.Data;
using CodeFlow.Api.DTOs;
using CodeFlow.Api.Models;

namespace CodeFlow.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/courses")]
[Authorize(Policy = "AdminOrTeacher")]
public class AdminCoursesController : ControllerBase
{
    private readonly AppDbContext _db;

    public AdminCoursesController(AppDbContext db)
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

    [HttpPost]
    public async Task<ActionResult<CourseDto>> Create([FromBody] CreateCourseRequest request, CancellationToken ct)
    {
        var id = await _db.Courses.AnyAsync(ct) ? await _db.Courses.MaxAsync(c => c.Id, ct) + 1 : 1;
        var course = new Course
        {
            Id = id,
            Title = request.Title,
            Description = request.Description,
            Level = request.Level ?? "",
            Color = request.Color ?? "green",
            TotalLessons = request.TotalLessons
        };
        _db.Courses.Add(course);
        await _db.SaveChangesAsync(ct);
        return CreatedAtAction(nameof(GetById), new { id = course.Id }, new CourseDto(course.Id, course.Title, course.Description, course.Level, course.Color, course.TotalLessons));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<CourseDto>> Update(int id, [FromBody] UpdateCourseRequest request, CancellationToken ct)
    {
        var course = await _db.Courses.FindAsync(new object[] { id }, ct);
        if (course == null) return NotFound();
        if (request.Title != null) course.Title = request.Title;
        if (request.Description != null) course.Description = request.Description;
        if (request.Level != null) course.Level = request.Level;
        if (request.Color != null) course.Color = request.Color;
        if (request.TotalLessons.HasValue) course.TotalLessons = request.TotalLessons.Value;
        await _db.SaveChangesAsync(ct);
        return Ok(new CourseDto(course.Id, course.Title, course.Description, course.Level, course.Color, course.TotalLessons));
    }

    [HttpDelete("{id:int}")]
    public async Task<ActionResult> Delete(int id, CancellationToken ct)
    {
        var course = await _db.Courses.FindAsync(new object[] { id }, ct);
        if (course == null) return NotFound();
        _db.Courses.Remove(course);
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }
}
