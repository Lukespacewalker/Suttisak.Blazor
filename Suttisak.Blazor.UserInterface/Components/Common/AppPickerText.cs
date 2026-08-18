namespace Suttisak.Blazor.UserInterface.Components.Common;

/// <summary>
/// Text used by the progressively enhanced date and time pickers.
/// Supply an instance populated by the consuming application's localization
/// layer to keep the reusable library independent of any resource system.
/// </summary>
public sealed record AppPickerText
{
    /// <summary>
    /// BCP 47 locale used for calendar month, weekday, year, and date labels.
    /// When omitted, the browser's current locale is used.
    /// </summary>
    public string? Locale { get; init; }

    public string OpenCalendarLabel { get; init; } = "Open calendar";
    public string OpenTimeLabel { get; init; } = "Open time picker";
    public string OpenDateTimeLabel { get; init; } = "Open date and time picker";
    public string CalendarDialogLabel { get; init; } = "Calendar";
    public string TimePickerDialogLabel { get; init; } = "Time picker";
    public string DateTimePickerDialogLabel { get; init; } = "Date and time picker";
    public string PreviousMonthLabel { get; init; } = "Previous month";
    public string NextMonthLabel { get; init; } = "Next month";
    public string MonthLabel { get; init; } = "Month";
    public string YearLabel { get; init; } = "Year";
    public string TimeLabel { get; init; } = "Time";
    public string ChooseTimeLabel { get; init; } = "Choose time";
    public string BrowserLocalTimeLabel { get; init; } = "Browser local time";
    public string HourLabel { get; init; } = "Hour";
    public string MinuteLabel { get; init; } = "Minute";
    public string SecondLabel { get; init; } = "Second";
    public string NowLabel { get; init; } = "Now";
    public string CancelLabel { get; init; } = "Cancel";
    public string ApplyLabel { get; init; } = "Apply";
    public string InvalidLocalTimeMessage { get; init; } = "This local time does not exist in the browser time zone.";
    public string AmbiguousLocalTimeMessage { get; init; } = "This local time occurs twice when the clock changes. Choose another time.";
}
