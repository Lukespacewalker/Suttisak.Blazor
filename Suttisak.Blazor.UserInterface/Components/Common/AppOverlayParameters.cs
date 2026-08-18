namespace Suttisak.Blazor.UserInterface.Components.Common;

/// <summary>Creates the parameter dictionary used to initialize a service-hosted overlay body.</summary>
public static class AppOverlayParameters
{
    public static IReadOnlyDictionary<string, object?> Create(params (string Name, object? Value)[] values) =>
        values.ToDictionary(value => value.Name, value => value.Value, StringComparer.Ordinal);
}
