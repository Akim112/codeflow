using System.Threading.Channels;

namespace CodeFlow.Api.Services;

public class SubmissionQueueService : ISubmissionQueue
{
    private readonly Channel<Guid> _channel = Channel.CreateUnbounded<Guid>(new UnboundedChannelOptions { SingleReader = true });

    public ValueTask EnqueueAsync(Guid submissionId, CancellationToken ct = default) =>
        _channel.Writer.WriteAsync(submissionId, ct);

    public async ValueTask<Guid?> DequeueAsync(CancellationToken ct = default)
    {
        var id = await _channel.Reader.ReadAsync(ct);
        return id;
    }
}
