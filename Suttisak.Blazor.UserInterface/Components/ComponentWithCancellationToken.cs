using Microsoft.AspNetCore.Components;

namespace Suttisak.Blazor.UserInterface.Components;

public abstract class ComponentWithCancellationToken : ComponentBase, IDisposable, IAsyncDisposable
{
    private CancellationTokenSource? _cancellationTokenSource;

    protected CancellationToken CtxWhenComponentDetached => (_cancellationTokenSource ??= new CancellationTokenSource()).Token;

    protected virtual void Dispose(bool disposing)
    {
        if (disposing is false) return;
        _cancellationTokenSource?.Cancel();
        _cancellationTokenSource?.Dispose();
    }

    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }

    protected virtual ValueTask DisposeAsyncCore()
    {
        _cancellationTokenSource?.Cancel();
        _cancellationTokenSource?.Dispose();
        return ValueTask.CompletedTask;
    }

    public async ValueTask DisposeAsync()
    {
        await DisposeAsyncCore();
        GC.SuppressFinalize(this);
    }
}