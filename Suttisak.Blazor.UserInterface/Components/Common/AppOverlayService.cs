using Microsoft.AspNetCore.Components;

namespace Suttisak.Blazor.UserInterface.Components.Common;

/// <summary>
/// Opens application-owned dialog and drawer bodies through a colocated <see cref="AppOverlayHost"/>.
/// Register it as scoped with <c>AddAppOverlays</c>.
/// </summary>
public sealed class AppOverlayService
{
    private readonly Queue<AppOverlayRequest> _requests = new();
    private readonly object _sync = new();
    private Func<Task>? _onRequestsChanged;

    public Task<AppOverlayResult<TResult>> ShowDialogAsync<TComponent, TResult>(
        AppOverlayOptions options,
        IReadOnlyDictionary<string, object?>? parameters = null)
        where TComponent : IComponent =>
        Enqueue<TResult>(AppOverlayKind.Dialog, typeof(TComponent), options, parameters, null);

    public Task<AppOverlayResult<TResult>> ShowDrawerAsync<TComponent, TResult>(
        AppOverlayOptions options,
        IReadOnlyDictionary<string, object?>? parameters = null)
        where TComponent : IComponent =>
        Enqueue<TResult>(AppOverlayKind.Drawer, typeof(TComponent), options, parameters, null);

    public Task<AppOverlayResult<TResult>> ShowDialogAsync<TResult>(
        AppOverlayOptions options,
        RenderFragment<AppOverlayController> body,
        RenderFragment<AppOverlayController>? footer = null) =>
        Enqueue<TResult>(AppOverlayKind.Dialog, null, options, null, new(body, footer));

    public Task<AppOverlayResult<TResult>> ShowDrawerAsync<TResult>(
        AppOverlayOptions options,
        RenderFragment<AppOverlayController> body,
        RenderFragment<AppOverlayController>? footer = null) =>
        Enqueue<TResult>(AppOverlayKind.Drawer, null, options, null, new(body, footer));

    public Task<AppOverlayResult<bool>> ShowConfirmationAsync(AppConfirmationOptions options) =>
        Enqueue<bool>(
            AppOverlayKind.Dialog,
            null,
            new AppOverlayOptions
            {
                Title = options.Title,
                Mode = options.Mode,
                Dangerous = options.Dangerous,
                PreventDismissOnOutsideClick = options.PreventDismissOnOutsideClick
            },
            null,
            null,
            new AppOverlayPreset(options.Message, options.ConfirmText, options.CancelText, true));

    public Task<AppOverlayResult<bool>> ShowErrorAsync(string message, string? title = null) =>
        Enqueue<bool>(
            AppOverlayKind.Dialog,
            null,
            new AppOverlayOptions { Title = title ?? "Error", Mode = AppDialogMode.Error },
            null,
            null,
            new AppOverlayPreset(message, "Close", null, false));

    public Task<AppOverlayResult<bool>> ShowInformationAsync(string message, string? title = null) =>
        Enqueue<bool>(
            AppOverlayKind.Dialog,
            null,
            new AppOverlayOptions { Title = title ?? "Information", Mode = AppDialogMode.Information },
            null,
            null,
            new AppOverlayPreset(message, "Close", null, false));

    public Task<AppOverlayResult<bool>> ShowSuccessAsync(string message, string? title = null) =>
        Enqueue<bool>(
            AppOverlayKind.Dialog,
            null,
            new AppOverlayOptions { Title = title ?? "Success", Mode = AppDialogMode.Success },
            null,
            null,
            new AppOverlayPreset(message, "Close", null, false));

    internal void Attach(Func<Task> onRequestsChanged) => _onRequestsChanged = onRequestsChanged;

    internal void Detach(Func<Task> onRequestsChanged)
    {
        if (_onRequestsChanged == onRequestsChanged) _onRequestsChanged = null;
    }

    internal bool TryDequeue(out AppOverlayRequest? request)
    {
        lock (_sync)
        {
            request = _requests.Count == 0 ? null : _requests.Dequeue();
            return request is not null;
        }
    }

    private Task<AppOverlayResult<TResult>> Enqueue<TResult>(
        AppOverlayKind kind,
        Type? componentType,
        AppOverlayOptions options,
        IReadOnlyDictionary<string, object?>? parameters,
        AppOverlayFragments? fragments,
        AppOverlayPreset? preset = null)
    {
        ArgumentNullException.ThrowIfNull(options);
        if (componentType is null && fragments is null && preset is null)
            throw new ArgumentException("An overlay needs a component body, a render fragment, or a built-in preset.");

        var request = new AppOverlayRequest<TResult>(kind, componentType, options, parameters, fragments, preset);
        Func<Task>? notify;
        lock (_sync)
        {
            _requests.Enqueue(request);
            notify = _onRequestsChanged;
        }
        _ = notify?.Invoke();
        return request.Task;
    }
}

internal enum AppOverlayKind { Dialog, Drawer }

internal sealed record AppOverlayFragments(
    RenderFragment<AppOverlayController> Body,
    RenderFragment<AppOverlayController>? Footer);

internal sealed record AppOverlayPreset(string Message, string ConfirmText, string? CancelText, bool IsConfirmation);

internal abstract class AppOverlayRequest
{
    protected AppOverlayRequest(
        AppOverlayKind kind,
        Type? componentType,
        AppOverlayOptions options,
        IReadOnlyDictionary<string, object?>? parameters,
        AppOverlayFragments? fragments,
        AppOverlayPreset? preset)
    {
        Kind = kind;
        ComponentType = componentType;
        Options = options;
        Parameters = parameters;
        Fragments = fragments;
        Preset = preset;
    }

    public AppOverlayKind Kind { get; }
    public Type? ComponentType { get; }
    public AppOverlayOptions Options { get; }
    public IReadOnlyDictionary<string, object?>? Parameters { get; }
    public AppOverlayFragments? Fragments { get; }
    public AppOverlayPreset? Preset { get; }
    public AppOverlayController? Controller { get; private set; }

    public void AttachController(AppOverlayController controller) => Controller = controller;
    public abstract void Complete(AppOverlayResult<object?> result);
    public abstract void Fault(Exception exception);
}

internal sealed class AppOverlayRequest<TResult> : AppOverlayRequest
{
    private readonly TaskCompletionSource<AppOverlayResult<TResult>> _completion = new(TaskCreationOptions.RunContinuationsAsynchronously);

    public AppOverlayRequest(
        AppOverlayKind kind,
        Type? componentType,
        AppOverlayOptions options,
        IReadOnlyDictionary<string, object?>? parameters,
        AppOverlayFragments? fragments,
        AppOverlayPreset? preset)
        : base(kind, componentType, options, parameters, fragments, preset) { }

    public Task<AppOverlayResult<TResult>> Task => _completion.Task;

    public override void Complete(AppOverlayResult<object?> result)
    {
        if (result.IsCancelled)
        {
            _completion.TrySetResult(AppOverlayResult<TResult>.Cancelled());
            return;
        }

        if (result.Value is null)
        {
            _completion.TrySetResult(AppOverlayResult<TResult>.FromValue(default!));
            return;
        }

        if (result.Value is TResult value)
        {
            _completion.TrySetResult(AppOverlayResult<TResult>.FromValue(value));
            return;
        }

        _completion.TrySetException(new InvalidCastException(
            $"Overlay returned {result.Value.GetType().FullName}, but {typeof(TResult).FullName} was requested."));
    }

    public override void Fault(Exception exception) => _completion.TrySetException(exception);
}
