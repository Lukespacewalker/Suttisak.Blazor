namespace Suttisak.Blazor.UserInterface.Providers;

public sealed class BrowserTimeProvider : TimeProvider
{
    private TimeZoneInfo? _browserLocalTimeZone;
    private bool _initializationInProgress;

    public event EventHandler? LocalTimeZoneChanged;

    // UTC is the safe prerendering fallback. Using the server's local zone would
    // make the rendered value change for reasons unrelated to the browser.
    public override TimeZoneInfo LocalTimeZone => _browserLocalTimeZone ?? TimeZoneInfo.Utc;

    public bool IsLocalTimeZoneSet => _browserLocalTimeZone is not null;

    internal bool TryBeginInitialization()
    {
        if (IsLocalTimeZoneSet || _initializationInProgress) return false;
        _initializationInProgress = true;
        return true;
    }

    internal void CompleteInitialization() => _initializationInProgress = false;

    public bool SetBrowserTimeZone(string? timeZoneId)
    {
        if (!BrowserTimeZone.TryFind(timeZoneId, out var timeZoneInfo))
        {
            return false;
        }

        if (_browserLocalTimeZone?.Equals(timeZoneInfo) is not true)
        {
            _browserLocalTimeZone = timeZoneInfo;
            LocalTimeZoneChanged?.Invoke(this, EventArgs.Empty);
        }

        return true;
    }
}
