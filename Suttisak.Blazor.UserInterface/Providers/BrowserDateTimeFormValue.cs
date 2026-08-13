using System.Globalization;

namespace Suttisak.Blazor.UserInterface.Providers;

/// <summary>
/// Represents the browser-owned fields posted by <c>AppDateTimePicker</c>.
/// The server recomputes the instant from the local wall time and IANA time-zone
/// identifier instead of trusting the client-provided UTC value.
/// </summary>
public sealed class BrowserDateTimeFormValue
{
    public string? LocalDateTime { get; set; }
    public string? UtcDateTime { get; set; }
    public string? TimeZoneId { get; set; }
    public int? UtcOffsetMinutes { get; set; }

    public bool TryGetUtcDateTimeOffset(out DateTimeOffset value, out string? error)
    {
        value = default;
        error = null;

        if (!TryParseLocalDateTime(LocalDateTime, out var localDateTime))
        {
            error = "Enter a valid local date and time.";
            return false;
        }

        if (!BrowserTimeZone.TryFind(TimeZoneId, out var timeZone))
        {
            error = "The browser time zone is missing or is not available on this server.";
            return false;
        }

        try
        {
            value = timeZone.ToUtcDateTimeOffset(localDateTime);
            return true;
        }
        catch (ArgumentException exception)
        {
            error = exception.Message;
            return false;
        }
    }

    private static bool TryParseLocalDateTime(string? text, out DateTime value)
    {
        var formats = new[]
        {
            "yyyy-MM-ddTHH:mm",
            "yyyy-MM-ddTHH:mm:ss",
            "yyyy-MM-ddTHH:mm:ss.FFFFFFF"
        };
        return DateTime.TryParseExact(
            text,
            formats,
            CultureInfo.InvariantCulture,
            DateTimeStyles.AllowWhiteSpaces,
            out value);
    }
}
