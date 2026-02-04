using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CodeFlow.Api.Data;
using CodeFlow.Api.DTOs;

namespace CodeFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SubmissionsController : ControllerBase
{
    private readonly AppDbContext _db;

    public SubmissionsController(AppDbContext db)
    {
        _db = db;
    }

    private Guid? UserId => Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : null;

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<SubmissionStatusDto>> GetById(Guid id, CancellationToken ct)
    {
        var userId = UserId;
        if (userId == null) return Unauthorized();

        var job = await _db.SubmissionJobs
            .AsNoTracking()
            .FirstOrDefaultAsync(j => j.Id == id && j.UserId == userId.Value, ct);
        if (job == null) return NotFound();

        return Ok(new SubmissionStatusDto(
            job.Id,
            job.Status,
            job.Output,
            job.Error,
            job.Passed,
            job.CreatedAtUtc,
            job.CompletedAtUtc
        ));
    }
}
