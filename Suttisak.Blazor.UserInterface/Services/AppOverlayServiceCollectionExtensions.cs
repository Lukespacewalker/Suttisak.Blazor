using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Suttisak.Blazor.UserInterface.Components.Common;

namespace Suttisak.Blazor.UserInterface.Services;

public static class AppOverlayServiceCollectionExtensions
{
    /// <summary>Registers the scoped service consumed by <see cref="AppOverlayHost"/>.</summary>
    public static IServiceCollection AddAppOverlays(this IServiceCollection services)
    {
        services.TryAddScoped<AppOverlayService>();
        return services;
    }
}
