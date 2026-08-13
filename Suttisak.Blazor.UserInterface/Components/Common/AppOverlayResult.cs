namespace Suttisak.Blazor.UserInterface.Components.Common;

public sealed record AppOverlayResult<TResult>(bool IsCancelled, TResult? Value)
{
    public bool HasValue => !IsCancelled;

    public static AppOverlayResult<TResult> Cancelled() => new(true, default);

    public static AppOverlayResult<TResult> FromValue(TResult value) => new(false, value);
}

public sealed class AppOverlayContext<TInput, TResult>
{
    internal AppOverlayContext(TInput value, Func<TResult, Task> closeAsync, Func<Task> cancelAsync)
    {
        Value = value;
        CloseAsync = closeAsync;
        CancelAsync = cancelAsync;
    }

    public TInput Value { get; }
    public Func<TResult, Task> CloseAsync { get; }
    public Func<Task> CancelAsync { get; }
}
