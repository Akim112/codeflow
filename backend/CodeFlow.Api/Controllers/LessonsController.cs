using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CodeFlow.Api.Data;
using CodeFlow.Api.DTOs;
using CodeFlow.Api.Models;
using CodeFlow.Api.Services;

namespace CodeFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LessonsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IPythonSandboxService _sandbox;
    private readonly ISubmissionQueue _queue;

    public LessonsController(AppDbContext db, IPythonSandboxService sandbox, ISubmissionQueue queue)
    {
        _db = db;
        _sandbox = sandbox;
        _queue = queue;
    }

    private Guid? UserId => Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : null;

    [HttpGet("{id:int}")]
    public async Task<ActionResult<LessonDto>> GetById(int id, CancellationToken ct)
    {
        var lesson = await _db.Lessons
            .Include(l => l.Course)
            .FirstOrDefaultAsync(l => l.Id == id, ct);
        if (lesson == null) return NotFound();
        return Ok(new LessonDto(
            lesson.Id, lesson.CourseId, lesson.Chapter, lesson.Title, lesson.Description,
            lesson.Task, lesson.InitialCode, lesson.ExpectedOutput, lesson.Xp,
            lesson.IsBoss, lesson.HasDebugger, lesson.Hint, lesson.Hint2
        ));
    }

    [HttpPost("{id:int}/submit")]
    [Authorize]
    public async Task<ActionResult<SubmitResultDto>> Submit(int id, [FromBody] SubmitCodeRequest request, CancellationToken ct)
    {
        var lesson = await _db.Lessons.FindAsync(new object[] { id }, ct);
        if (lesson == null) return NotFound();

        var result = await _sandbox.RunAsync(request.Code, TimeSpan.FromSeconds(10), ct);
        var output = NormalizeOutput(result.Output);
        var expected = NormalizeOutput(lesson.ExpectedOutput);
        var passed = result.Success && output == expected;

        return Ok(new SubmitResultDto(
            passed,
            result.Output,
            lesson.ExpectedOutput,
            result.Error,
            result.FailureReason
        ));
    }

    /// <summary> Асинхронная отправка кода: создаётся задача, результат проверяется по GET /api/submissions/{jobId}. </summary>
    [HttpPost("{id:int}/submit-async")]
    [Authorize]
    public async Task<ActionResult<SubmitAsyncResponse>> SubmitAsync(int id, [FromBody] SubmitCodeRequest request, CancellationToken ct)
    {
        var userId = UserId;
        if (userId == null) return Unauthorized();

        var lesson = await _db.Lessons.FindAsync(new object[] { id }, ct);
        if (lesson == null) return NotFound();

        var job = new SubmissionJob
        {
            Id = Guid.NewGuid(),
            UserId = userId.Value,
            LessonId = id,
            Code = request.Code,
            Status = "Pending",
            CreatedAtUtc = DateTime.UtcNow
        };
        _db.SubmissionJobs.Add(job);
        await _db.SaveChangesAsync(ct);
        await _queue.EnqueueAsync(job.Id, ct);

        return Accepted(new SubmitAsyncResponse(job.Id));
    }

    private static string NormalizeOutput(string s)
    {
        if (string.IsNullOrEmpty(s)) return "";
        return s.TrimEnd().Replace("\r\n", "\n").Replace("\r", "\n");
    }
}
