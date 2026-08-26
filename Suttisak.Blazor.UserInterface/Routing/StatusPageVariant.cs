namespace Suttisak.Blazor.UserInterface.Routing;

/// <summary>
/// Visual and semantic treatment for a <see cref="StatusPage"/>.
/// </summary>
public enum StatusPageVariant
{
    /// <summary>A neutral status or application-owned custom state.</summary>
    Status,

    /// <summary>An access-restricted state.</summary>
    Forbidden,

    /// <summary>A missing resource or route.</summary>
    Missing,

    /// <summary>An unexpected or recoverable system error.</summary>
    Error
}
