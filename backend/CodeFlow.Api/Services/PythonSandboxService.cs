using System.Diagnostics;
using System.Text;

namespace CodeFlow.Api.Services;

/// <summary>
/// Запуск пользовательского Python-кода в Docker-контейнере с лимитами (память, время).
/// </summary>
public class PythonSandboxService : IPythonSandboxService
{
    private readonly IConfiguration _config;
    private readonly ILogger<PythonSandboxService> _logger;
    private const string Image = "python:3.11-slim";
    private const int DefaultTimeoutSeconds = 10;
    private const int MemoryMb = 128;

    public PythonSandboxService(IConfiguration config, ILogger<PythonSandboxService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task<RunResult> RunAsync(string code, TimeSpan? timeout = null, CancellationToken ct = default)
    {
        var timeoutSec = (int)(timeout?.TotalSeconds ?? _config.GetValue("Sandbox:TimeoutSeconds", DefaultTimeoutSeconds));
        var workDir = Path.Combine(Path.GetTempPath(), "codeflow-sandbox", Guid.NewGuid().ToString("N"));
        try
        {
            Directory.CreateDirectory(workDir);
            var scriptPath = Path.Combine(workDir, "main.py");
            await File.WriteAllTextAsync(scriptPath, code, Encoding.UTF8, ct);

            var args = $"run --rm --network none --memory {MemoryMb}m --pids-limit 50 -v \"{workDir}\":/app -w /app {Image} timeout {timeoutSec} python main.py 2>&1";
            var startInfo = new ProcessStartInfo
            {
                FileName = "docker",
                Arguments = args,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            using var process = new Process { StartInfo = startInfo };
            var outputSb = new StringBuilder();
            var errorSb = new StringBuilder();
            process.OutputDataReceived += (_, e) => { if (e.Data != null) outputSb.AppendLine(e.Data); };
            process.ErrorDataReceived += (_, e) => { if (e.Data != null) errorSb.AppendLine(e.Data); };

            process.Start();
            process.BeginOutputReadLine();
            process.BeginErrorReadLine();

            var completed = await Task.Run(() => process.WaitForExit((timeoutSec + 5) * 1000), ct);
            if (!completed)
            {
                try { process.Kill(entireProcessTree: true); } catch { /* ignore */ }
                return new RunResult(false, outputSb.ToString(), errorSb.ToString(), null, "Timeout");
            }

            var output = outputSb.ToString().TrimEnd();
            var error = errorSb.ToString().TrimEnd();
            var success = process.ExitCode == 0;
            return new RunResult(success, output, error.Length > 0 ? error : null, process.ExitCode, success ? null : "Execution failed");
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Sandbox run failed (Docker may be unavailable)");
            return new RunResult(false, "", ex.Message, null, "Sandbox unavailable (Docker required)");
        }
        finally
        {
            try { if (Directory.Exists(workDir)) Directory.Delete(workDir, recursive: true); } catch { /* ignore */ }
        }
    }
}
