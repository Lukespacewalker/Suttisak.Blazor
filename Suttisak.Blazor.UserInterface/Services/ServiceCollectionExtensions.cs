using Microsoft.Extensions.DependencyInjection;
using Suttisak.Blazor.UserInterface.Interfaces.Theme;
using Suttisak.Blazor.UserInterface.Providers;

namespace Suttisak.Blazor.UserInterface.Services;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddBlazorUserInterface(
        this IServiceCollection services,
        Action<BlazorUIOptions> configuration)
    {
        services.Configure(configuration);
        services.AddScoped<IThemeService, ThemeService>();
        services.AddBrowserTimeProvider();
        return services;
    }
}
