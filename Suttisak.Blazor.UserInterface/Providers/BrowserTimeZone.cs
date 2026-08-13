namespace Suttisak.Blazor.UserInterface.Providers;

public static class BrowserTimeZone
{
    public static bool TryFind(string? timeZoneId, out TimeZoneInfo timeZoneInfo)
    {
        if (!string.IsNullOrWhiteSpace(timeZoneId)
            && TimeZoneInfo.TryFindSystemTimeZoneById(timeZoneId, out timeZoneInfo!))
        {
            return true;
        }

        if (!string.IsNullOrWhiteSpace(timeZoneId)
            && TimeZoneInfo.TryConvertIanaIdToWindowsId(timeZoneId, out var windowsId)
            && TimeZoneInfo.TryFindSystemTimeZoneById(windowsId, out timeZoneInfo!))
        {
            return true;
        }

        timeZoneInfo = null!;
        return false;
    }
}
