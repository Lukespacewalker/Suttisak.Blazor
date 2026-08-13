namespace Suttisak.Blazor.UserInterface.Components.Common;

public sealed record AppSelectOption<TValue>(TValue Value, string Label, bool Disabled = false);
