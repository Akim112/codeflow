using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CodeFlow.Api.DTOs;
using CodeFlow.Api.Services;

namespace CodeFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProgressController : ControllerBase
{
    private readonly IProgressService _progress;

    public ProgressController(IProgressService progress)
    {
        _progress = progress;
    }

    private Guid? UserId => Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : null;

    [HttpGet]
    public async Task<ActionResult<UserProgressSummaryDto>> GetMyProgress(CancellationToken ct)
    {
        var userId = UserId;
        if (userId == null) return Unauthorized();
        var summary = await _progress.GetProgressAsync(userId.Value, ct);
        if (summary == null) return NotFound();
        return Ok(summary);
    }

    [HttpPost("complete")]
    public async Task<ActionResult<ProgressDto>> CompleteLesson([FromBody] CompleteLessonRequest request, CancellationToken ct)
    {
        var userId = UserId;
        if (userId == null) return Unauthorized();
        var result = await _progress.CompleteLessonAsync(userId.Value, request, ct);
        if (result == null) return BadRequest(new { message = "Lesson not found or already completed." });
        return Ok(result);
    }

    [HttpPost("purchase-hint")]
    public async Task<ActionResult<XpBalanceDto>> PurchaseHint([FromBody] PurchaseHintRequest request, CancellationToken ct)
    {
        var userId = UserId;
        if (userId == null) return Unauthorized();
        var result = await _progress.PurchaseHintAsync(userId.Value, request, ct);
        if (result == null) return BadRequest(new { message = "Not enough XP or invalid price." });
        return Ok(result);
    }

    [HttpPost("moral-choice")]
    public async Task<ActionResult<XpBalanceDto>> MoralChoice([FromBody] MoralChoiceRequest request, CancellationToken ct)
    {
        var userId = UserId;
        if (userId == null) return Unauthorized();
        var result = await _progress.ApplyMoralChoiceAsync(userId.Value, request, ct);
        if (result == null) return BadRequest(new { message = "Invalid moral choice payload." });
        return Ok(result);
    }

    [HttpPost("reset")]
    public async Task<ActionResult> Reset(CancellationToken ct)
    {
        var userId = UserId;
        if (userId == null) return Unauthorized();
        var ok = await _progress.ResetProgressAsync(userId.Value, ct);
        if (!ok) return NotFound();
        return Ok(new { message = "Progress reset completed." });
    }
}
