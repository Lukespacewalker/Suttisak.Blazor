using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace Suttisak.Blazor.UserInterface.Providers;

public static class TimeProviderExtensions
{
    public static DateTime ToLocalDateTime(this TimeProvider timeProvider, DateTime dateTime)
    {
        var utc = dateTime.Kind switch
        {
            DateTimeKind.Unspecified => throw new InvalidOperationException("Unable to convert unspecified DateTime to local time"),
            DateTimeKind.Local => dateTime.ToUniversalTime(),
            _ => dateTime,
        };
        return DateTime.SpecifyKind(
            TimeZoneInfo.ConvertTimeFromUtc(utc, timeProvider.LocalTimeZone),
            DateTimeKind.Unspecified);
    }

    public static DateTime ToLocalDateTime(this TimeProvider timeProvider, DateTimeOffset dateTime)
    {
        return DateTime.SpecifyKind(
            TimeZoneInfo.ConvertTimeFromUtc(dateTime.UtcDateTime, timeProvider.LocalTimeZone),
            DateTimeKind.Unspecified);
    }

    public static DateTimeOffset ToLocalDateTimeOffset(this TimeProvider timeProvider, DateTimeOffset dateTime)
    {
        return TimeZoneInfo.ConvertTime(dateTime.ToUniversalTime(), timeProvider.LocalTimeZone);
    }

    public static DateTimeOffset ToUtcDateTimeOffset(this TimeProvider timeProvider, DateTime localDateTime)
        => timeProvider.LocalTimeZone.ToUtcDateTimeOffset(localDateTime);

    public static DateTimeOffset ToUtcDateTimeOffset(this TimeZoneInfo timeZone, DateTime localDateTime)
    {
        var unspecified = DateTime.SpecifyKind(localDateTime, DateTimeKind.Unspecified);
        if (timeZone.IsInvalidTime(unspecified))
        {
            throw new ArgumentException("The selected local time does not exist in the browser time zone.", nameof(localDateTime));
        }

        if (timeZone.IsAmbiguousTime(unspecified))
        {
            throw new ArgumentException("The selected local time is ambiguous in the browser time zone.", nameof(localDateTime));
        }

        return new DateTimeOffset(TimeZoneInfo.ConvertTimeToUtc(unspecified, timeZone));
    }
}

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddBrowserTimeProvider(this IServiceCollection services)
    {
        services.TryAddKeyedScoped<TimeProvider, BrowserTimeProvider>(nameof(BrowserTimeProvider));
        return services;
    }
}
