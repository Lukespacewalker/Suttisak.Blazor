namespace Suttisak.Blazor.UserInterface.Routing;

/// <summary>Requests host-owned route components for the shared HTTP status UI.</summary>
/// <remarks>
/// Apply this attribute once at assembly level in the host application. The
/// generated components belong to the host assembly, so its existing Router
/// discovers them without adding the UI library to AdditionalAssemblies.
/// </remarks>
[AttributeUsage(AttributeTargets.Assembly, AllowMultiple = false)]
public sealed class GenerateStatusRouteAdaptersAttribute : Attribute
{
    /// <summary>Namespace for the generated route components.</summary>
    public string? Namespace { get; init; }

    /// <summary>Optional host layout applied to every generated status route.</summary>
    public Type? LayoutType { get; set; }

    /// <summary>
    /// Adapter names to omit: Forbidden, NotFound, Error, or StatusCode.
    /// Use this when the host owns a customized route.
    /// </summary>
    public string[]? ExcludedPages { get; set; }
}
