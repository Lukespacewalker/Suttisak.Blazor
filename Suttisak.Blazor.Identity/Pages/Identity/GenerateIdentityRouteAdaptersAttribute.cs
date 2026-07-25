namespace Suttisak.Blazor.Identity.Pages.Identity;

/// <summary>Requests route components for the shared Identity pages to be generated.</summary>
/// <remarks>
/// Apply this attribute once at assembly level in the host application. The
/// route-adapter generator must be referenced as an analyzer.
/// </remarks>
[AttributeUsage(AttributeTargets.Assembly, AllowMultiple = false)]
public sealed class GenerateIdentityRouteAdaptersAttribute(Type userType) : Attribute
{
    /// <summary>The application's ASP.NET Core Identity user type.</summary>
    public Type UserType { get; } = userType;

    /// <summary>
    /// Namespace for the generated route components. When omitted, the host
    /// application's root namespace is used.
    /// </summary>
    public string? Namespace { get; init; }

    /// <summary>Host layout applied to each generated route component.</summary>
    public Type? LayoutType { get; set; }

    /// <summary>Host layout applied to generated account-management route components.</summary>
    public Type? ManageLayoutType { get; set; }

    /// <summary>
    /// Applies <see cref="Microsoft.AspNetCore.Components.ExcludeFromInteractiveRoutingAttribute"/>
    /// to generated adapters. Enabled by default to match the server Identity
    /// page pattern.
    /// </summary>
    public bool ExcludeFromInteractiveRouting { get; set; } = true;

    /// <summary>
    /// Adapter names to omit. Use this when the application owns a customized
    /// implementation of one of the shared screens.
    /// </summary>
    public string[]? ExcludedPages { get; set; }
}
