using Microsoft.Extensions.DependencyInjection;

namespace Suttisak.Blazor.Identity;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddBlazorIdentity<TUser>(
        this IServiceCollection services) where TUser : class
    {
        services.AddScoped<IdentityRedirectManager<TUser>>();
        services.AddScoped<IdentityRedirectManager>(serviceProvider =>
            serviceProvider.GetRequiredService<IdentityRedirectManager<TUser>>());
        services.AddScoped<IdentityUserAccessor<TUser>>();
        return services;
    }
}