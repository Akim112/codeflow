using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CodeFlow.Api.Data;

namespace CodeFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    private readonly AppDbContext _db;

    public HealthController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<object>> Get(CancellationToken ct)
    {
        try
        {
            await _db.Database.CanConnectAsync(ct);
            return Ok(new { status = "ok", database = "connected" });
        }
        catch
        {
            return StatusCode(503, new { status = "degraded", database = "disconnected" });
        }
    }
}
