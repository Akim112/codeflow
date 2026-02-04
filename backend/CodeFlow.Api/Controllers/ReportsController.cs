using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CodeFlow.Api.Data;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace CodeFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly AppDbContext _db;

    public ReportsController(AppDbContext db)
    {
        _db = db;
    }

    private Guid? UserId => Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : null;

    [HttpGet("progress")]
    public async Task<IActionResult> ExportProgress([FromQuery] string format = "csv", CancellationToken ct = default)
    {
        var userId = UserId;
        if (userId == null) return Unauthorized();

        var user = await _db.Users.FindAsync(new object[] { userId.Value }, ct);
        if (user == null) return NotFound();

        var progress = await _db.UserProgress
            .Where(p => p.UserId == userId.Value)
            .Include(p => p.Lesson)
            .OrderBy(p => p.CompletedAtUtc)
            .Select(p => new { p.LessonId, LessonTitle = p.Lesson.Title, p.CompletedAtUtc, p.XpEarned, p.WasCleanRun })
            .ToListAsync(ct);

        if (format.Equals("csv", StringComparison.OrdinalIgnoreCase))
        {
            var csv = new StringBuilder();
            csv.AppendLine("LessonId;LessonTitle;CompletedAtUtc;XpEarned;WasCleanRun");
            foreach (var p in progress)
                csv.AppendLine($"{p.LessonId};{EscapeCsv(p.LessonTitle)};{p.CompletedAtUtc:O};{p.XpEarned};{p.WasCleanRun}");
            csv.AppendLine();
            csv.AppendLine($"TotalXp;{user.TotalXp}");
            return File(Encoding.UTF8.GetBytes(csv.ToString()), "text/csv; charset=utf-8", "progress.csv");
        }

        if (format.Equals("pdf", StringComparison.OrdinalIgnoreCase))
        {
            var bytes = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(2, Unit.Centimetre);
                    page.Header().Text("Отчёт по прогрессу — CodeFlow").Bold().FontSize(18).FontColor(Colors.Blue.Medium);
                    page.Content().PaddingTop(1, Unit.Centimetre).Table(table =>
                    {
                        table.ColumnsDefinition(c =>
                        {
                            c.ConstantColumn(40);
                            c.RelativeColumn();
                            c.ConstantColumn(80);
                            c.ConstantColumn(60);
                            c.ConstantColumn(70);
                        });
                        table.Header(h =>
                        {
                            h.Cell().BorderBottom(1).Padding(4).Text("#").Bold();
                            h.Cell().BorderBottom(1).Padding(4).Text("Урок").Bold();
                            h.Cell().BorderBottom(1).Padding(4).Text("Дата").Bold();
                            h.Cell().BorderBottom(1).Padding(4).Text("XP").Bold();
                            h.Cell().BorderBottom(1).Padding(4).Text("Чистый").Bold();
                        });
                        var i = 1;
                        foreach (var p in progress)
                        {
                            table.Cell().Padding(4).Text(i.ToString());
                            table.Cell().Padding(4).Text(p.LessonTitle);
                            table.Cell().Padding(4).Text(p.CompletedAtUtc.ToString("yyyy-MM-dd HH:mm"));
                            table.Cell().Padding(4).Text(p.XpEarned.ToString());
                            table.Cell().Padding(4).Text(p.WasCleanRun ? "Да" : "Нет");
                            i++;
                        }
                    });
                    page.Footer().AlignCenter().Text(x => { x.Span("Всего XP: "); x.Span(user.TotalXp.ToString()); });
                });
            }).GeneratePdf();
            return File(bytes, "application/pdf", "progress.pdf");
        }

        return BadRequest(new { message = "Supported format: csv, pdf" });
    }

    [HttpGet("leaderboard")]
    public async Task<IActionResult> ExportLeaderboard([FromQuery] string format = "csv", [FromQuery] int limit = 100, CancellationToken ct = default)
    {
        if (limit <= 0 || limit > 500) limit = 100;

        var list = await _db.Users
            .OrderByDescending(u => u.TotalXp)
            .Take(limit)
            .Select(u => new { u.Id, u.DisplayName, u.TotalXp, u.CreatedAtUtc })
            .ToListAsync(ct);

        if (format.Equals("csv", StringComparison.OrdinalIgnoreCase))
        {
            var csv = new StringBuilder();
            csv.AppendLine("Rank;UserId;DisplayName;TotalXp;CreatedAtUtc");
            var rank = 1;
            foreach (var u in list)
            {
                csv.AppendLine($"{rank};{u.Id};{EscapeCsv(u.DisplayName)};{u.TotalXp};{u.CreatedAtUtc:O}");
                rank++;
            }
            return File(Encoding.UTF8.GetBytes(csv.ToString()), "text/csv; charset=utf-8", "leaderboard.csv");
        }

        if (format.Equals("pdf", StringComparison.OrdinalIgnoreCase))
        {
            var bytes = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(2, Unit.Centimetre);
                    page.Header().Text("Рейтинг — CodeFlow").Bold().FontSize(18).FontColor(Colors.Blue.Medium);
                    page.Content().PaddingTop(1, Unit.Centimetre).Table(table =>
                    {
                        table.ColumnsDefinition(c =>
                        {
                            c.ConstantColumn(50);
                            c.RelativeColumn();
                            c.ConstantColumn(80);
                            c.ConstantColumn(90);
                        });
                        table.Header(h =>
                        {
                            h.Cell().BorderBottom(1).Padding(4).Text("Место").Bold();
                            h.Cell().BorderBottom(1).Padding(4).Text("Имя").Bold();
                            h.Cell().BorderBottom(1).Padding(4).Text("XP").Bold();
                            h.Cell().BorderBottom(1).Padding(4).Text("Регистрация").Bold();
                        });
                        var rank = 1;
                        foreach (var u in list)
                        {
                            table.Cell().Padding(4).Text(rank.ToString());
                            table.Cell().Padding(4).Text(u.DisplayName);
                            table.Cell().Padding(4).Text(u.TotalXp.ToString());
                            table.Cell().Padding(4).Text(u.CreatedAtUtc.ToString("yyyy-MM-dd"));
                            rank++;
                        }
                    });
                });
            }).GeneratePdf();
            return File(bytes, "application/pdf", "leaderboard.pdf");
        }

        return BadRequest(new { message = "Supported format: csv, pdf" });
    }

    private static string EscapeCsv(string s)
    {
        if (string.IsNullOrEmpty(s)) return "";
        if (s.Contains(';') || s.Contains('"') || s.Contains('\n'))
            return "\"" + s.Replace("\"", "\"\"") + "\"";
        return s;
    }
}
