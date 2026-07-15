using Microsoft.AspNetCore.Components.Authorization;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace Suttisak.Blazor.Identity;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddBlazorIdentity<TUser>(
        this IServiceCollection services) where TUser : class
    {
        // Register generic and non-generic versions of IdentityRedirectManager
        services.AddScoped<IdentityRedirectManager<TUser>>();
        services.AddScoped<IdentityRedirectManager>(serviceProvider =>
            serviceProvider.GetRequiredService<IdentityRedirectManager<TUser>>());

        // Register IdentityUserAccessor
        services.AddScoped<IdentityUserAccessor<TUser>>();
        services.TryAddScoped<IExternalLoginProfileStore<TUser>, NullExternalLoginProfileStore<TUser>>();

        // Register IdentityRevalidatingAuthenticationStateProvider
        services.AddScoped<AuthenticationStateProvider, IdentityRevalidatingAuthenticationStateProvider<TUser>>();
        return services;
    }
}
