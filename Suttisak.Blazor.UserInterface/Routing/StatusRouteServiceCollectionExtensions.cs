using Microsoft.Extensions.DependencyInjection;

namespace Suttisak.Blazor.UserInterface.Routing;

public static class StatusRouteServiceCollectionExtensions
{
    /// <summary>Configures application-owned branding and copy for generated status routes.</summary>
    public static IServiceCollection AddSuttisakStatusRoutes(
        this IServiceCollection services,
        Action<StatusRouteOptions>? configure = null)
    {
        var options = services.AddOptions<StatusRouteOptions>();
        if (configure is not null)
            options.Configure(configure);

        return services;
    }
}
