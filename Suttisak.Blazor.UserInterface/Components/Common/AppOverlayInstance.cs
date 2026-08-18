using Microsoft.AspNetCore.Components;

namespace Suttisak.Blazor.UserInterface.Components.Common;

/// <summary>
/// Base class for a component opened by <see cref="AppOverlayService"/>.
/// It replaces a dialog-instance base class without coupling the body to a UI vendor.
/// </summary>
public abstract class AppOverlayInstance : ComponentBase
{
    [CascadingParameter] private AppOverlayController? Controller { get; set; }

    protected Task CloseAsync(object? result = null) =>
        (Controller ?? throw new InvalidOperationException("This component must be rendered by AppOverlayHost.")).CloseAsync(result);

    protected Task CancelAsync() =>
        (Controller ?? throw new InvalidOperationException("This component must be rendered by AppOverlayHost.")).CancelAsync();
}

/// <summary>Strongly typed base class for a component opened by an overlay service.</summary>
public abstract class AppOverlayInstance<TResult> : AppOverlayInstance
{
    protected Task CloseAsync(TResult result) => base.CloseAsync(result);
}

/// <summary>Provides a service-hosted overlay body with close and cancel operations.</summary>
public sealed class AppOverlayController
{
    private readonly Func<object?, Task> _closeAsync;
    private readonly Func<Task> _cancelAsync;

    internal AppOverlayController(Func<object?, Task> closeAsync, Func<Task> cancelAsync)
    {
        _closeAsync = closeAsync;
        _cancelAsync = cancelAsync;
    }

    public Task CloseAsync(object? result = null) => _closeAsync(result);
    public Task CancelAsync() => _cancelAsync();
}
