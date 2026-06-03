using Microsoft.Extensions.DependencyInjection;

namespace Suttisak.Blazor.UserInterface.Providers;
public static class TimeProviderExtensions
{
    public static DateTime ToLocalDateTime(this TimeProvider timeProvider, DateTime dateTime)
    {
        return dateTime.Kind switch
        {
            DateTimeKind.Unspecified => throw new InvalidOperationException("Unable to convert unspecified DateTime to local time"),
            DateTimeKind.Local => dateTime,
            _ => DateTime.SpecifyKind(TimeZoneInfo.ConvertTimeFromUtc(dateTime, timeProvider.LocalTimeZone), DateTimeKind.Local),
        };
    }

    public static DateTime ToLocalDateTime(this TimeProvider timeProvider, DateTimeOffset dateTime)
    {
        var local = TimeZoneInfo.ConvertTimeFromUtc(dateTime.UtcDateTime, timeProvider.LocalTimeZone);
        local = DateTime.SpecifyKind(local, DateTimeKind.Local);
        return local;
    }
}

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddBrowserTimeProvider(this IServiceCollection services)
        => services.AddKeyedScoped<TimeProvider, BrowserTimeProvider>(nameof(BrowserTimeProvider));
}
