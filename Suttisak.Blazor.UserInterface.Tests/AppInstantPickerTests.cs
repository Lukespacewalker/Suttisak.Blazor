using Bunit;
using Microsoft.AspNetCore.Components;
using Microsoft.Extensions.DependencyInjection;
using Suttisak.Blazor.UserInterface.Components.Common;
using Suttisak.Blazor.UserInterface.Providers;

namespace Suttisak.Blazor.UserInterface.Tests;

public sealed class AppInstantPickerTests
{
    [Fact]
    public void Date_time_picker_displays_and_round_trips_an_instant_in_the_browser_time_zone()
    {
        using var context = CreateContext("America/New_York");
        DateTimeOffset? changed = null;
        var instant = new DateTimeOffset(2026, 7, 1, 13, 30, 0, TimeSpan.Zero);
        var cut = context.Render<AppDateTimePicker>(parameters => parameters
            .Add(component => component.InstantValue, instant)
            .Add(component => component.InstantValueChanged, EventCallback.Factory.Create<DateTimeOffset?>(context, value => changed = value)));

        Assert.Equal("2026-07-01T09:30", cut.Find("input[type=datetime-local]").GetAttribute("value"));

        cut.Find("input[type=datetime-local]").Change("2026-07-02T10:45");

        Assert.Equal(new DateTimeOffset(2026, 7, 2, 14, 45, 0, TimeSpan.Zero), changed);
    }

    [Fact]
    public void Calendar_picker_preserves_local_time_and_uses_the_selected_dates_dst_offset()
    {
        using var context = CreateContext("America/New_York");
        DateTimeOffset? changed = null;
        var instant = new DateTimeOffset(2026, 7, 1, 13, 30, 0, TimeSpan.Zero);
        var cut = context.Render<AppCalendarPicker>(parameters => parameters
            .Add(component => component.InstantValue, instant)
            .Add(component => component.InstantValueChanged, EventCallback.Factory.Create<DateTimeOffset?>(context, value => changed = value)));

        Assert.Equal("2026-07-01", cut.Find("input[type=date]").GetAttribute("value"));

        cut.Find("input[type=date]").Change("2026-12-01");

        Assert.Equal(new DateTimeOffset(2026, 12, 1, 14, 30, 0, TimeSpan.Zero), changed);
    }

    [Fact]
    public void Instant_picker_reacts_when_browser_time_zone_is_initialized_after_rendering()
    {
        using var context = CreateContext();
        var instant = new DateTimeOffset(2026, 7, 1, 13, 30, 0, TimeSpan.Zero);
        var cut = context.Render<AppDateTimePicker>(parameters => parameters
            .Add(component => component.InstantValue, instant));

        Assert.Equal("2026-07-01T13:30", cut.Find("input[type=datetime-local]").GetAttribute("value"));

        GetBrowserClock(context).SetBrowserTimeZone("America/New_York");

        cut.WaitForAssertion(() => Assert.Equal("2026-07-01T09:30", cut.Find("input[type=datetime-local]").GetAttribute("value")));
    }

    [Theory]
    [InlineData("2026-03-08T02:30", "does not exist")]
    [InlineData("2026-11-01T01:30", "ambiguous")]
    public void Date_time_picker_rejects_invalid_or_ambiguous_browser_local_times(string localValue, string errorFragment)
    {
        using var context = CreateContext("America/New_York");
        var cut = context.Render<AppDateTimePicker>(parameters => parameters
            .Add(component => component.InstantValueChanged, EventCallback.Factory.Create<DateTimeOffset?>(context, _ => { })));

        var exception = Assert.Throws<ArgumentException>(() =>
            cut.Find("input[type=datetime-local]").Change(localValue));

        Assert.Contains(errorFragment, exception.Message, StringComparison.OrdinalIgnoreCase);
    }

    private static BunitContext CreateContext(string? timeZoneId = null)
    {
        var context = new BunitContext();
        context.Services.AddKeyedScoped<TimeProvider, BrowserTimeProvider>(nameof(BrowserTimeProvider));
        if (timeZoneId is not null)
        {
            GetBrowserClock(context).SetBrowserTimeZone(timeZoneId);
        }
        return context;
    }

    private static BrowserTimeProvider GetBrowserClock(BunitContext context)
        => (BrowserTimeProvider)context.Services.GetRequiredKeyedService<TimeProvider>(nameof(BrowserTimeProvider));
}
