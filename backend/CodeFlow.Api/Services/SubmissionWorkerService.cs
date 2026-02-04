using Microsoft.EntityFrameworkCore;
using CodeFlow.Api.Data;
using CodeFlow.Api.Models;

namespace CodeFlow.Api.Services;

public class SubmissionWorkerService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<SubmissionWorkerService> _logger;

    public SubmissionWorkerService(IServiceScopeFactory scopeFactory, ILogger<SubmissionWorkerService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var queue = scope.ServiceProvider.GetRequiredService<ISubmissionQueue>();
                var sandbox = scope.ServiceProvider.GetRequiredService<IPythonSandboxService>();
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                var id = await queue.DequeueAsync(stoppingToken);
                if (!id.HasValue) continue;

                var job = await db.SubmissionJobs.Include(j => j.Lesson).FirstOrDefaultAsync(j => j.Id == id.Value, stoppingToken);
                if (job == null || job.Status != "Pending") continue;

                job.Status = "Running";
                await db.SaveChangesAsync(stoppingToken);

                var result = await sandbox.RunAsync(job.Code, TimeSpan.FromSeconds(10), stoppingToken);
                var output = Normalize(result.Output);
                var expected = Normalize(job.Lesson.ExpectedOutput);
                job.Output = result.Output;
                job.Error = result.Error;
                job.Passed = result.Success && output == expected;
                job.Status = result.Success ? "Completed" : "Failed";
                job.CompletedAtUtc = DateTime.UtcNow;
                await db.SaveChangesAsync(stoppingToken);
            }
            catch (OperationCanceledException) { break; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Submission worker error");
                await Task.Delay(1000, stoppingToken);
            }
        }
    }

    private static string Normalize(string s) =>
        string.IsNullOrEmpty(s) ? "" : s.TrimEnd().Replace("\r\n", "\n").Replace("\r", "\n");
}
