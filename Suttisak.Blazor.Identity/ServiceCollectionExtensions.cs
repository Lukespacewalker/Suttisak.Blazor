using Microsoft.Extensions.DependencyInjection;

namespace Suttisak.Blazor.Identity;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddBlazorIdentity<TApplicationUser>(
        this IServiceCollection services) where TApplicationUser : class
    {
        services.AddScoped<IdentityRedirectManager<TApplicationUser>>();
        services.AddScoped<IdentityRedirectManager>(serviceProvider =>
            serviceProvider.GetRequiredService<IdentityRedirectManager<TApplicationUser>>());
        services.AddScoped<IdentityUserAccessor<TApplicationUser>>();
        return services;
    }
}