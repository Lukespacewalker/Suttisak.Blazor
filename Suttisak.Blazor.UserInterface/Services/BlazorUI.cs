using Microsoft.Extensions.DependencyInjection;

namespace Suttisak.BlazorUI.Services
{
    public class BlazorUIOptions
    {
        public string? LogoAssetPath { get; set; }
        public string? LoginUrl { get; set; }
    }

    public static class ServiceCollectionExtensions
    {
        /// <summary>
        /// Adds Blazor UI services to the specified service collection.
        /// </summary>
        /// <param name="services">The service collection to which the Blazor UI services will be added. Cannot be null.</param>
        /// <param name="configuration">An optional configuration object used to customize the Blazor UI services. If null, default settings are
        /// applied.</param>
        /// <returns>The service collection with Blazor UI services registered. This enables method chaining.</returns>
        public static IServiceCollection AddBlazorUI(
            this IServiceCollection services,
            Action<BlazorUIOptions> configuration)
        {
            services.Configure(configuration);

            return services;
        }

    }
}
