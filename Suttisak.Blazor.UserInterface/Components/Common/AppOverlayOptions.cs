namespace Suttisak.Blazor.UserInterface.Components.Common;

/// <summary>Presentation and dismissal settings for a service-hosted overlay.</summary>
public sealed record AppOverlayOptions
{
    public required string Title { get; init; }
    public string? Description { get; init; }
    public AppDialogMode Mode { get; init; }
    public bool Dangerous { get; init; }
    public bool Dismissible { get; init; } = true;
    public bool PreventDismissOnOutsideClick { get; init; }
    public string? Class { get; init; }
    public AppDrawerPosition DrawerPosition { get; init; } = AppDrawerPosition.End;
    public AppDrawerSize DrawerSize { get; init; } = AppDrawerSize.Standard;
}

/// <summary>Labels and severity for the built-in confirmation overlay.</summary>
public sealed record AppConfirmationOptions
{
    public required string Title { get; init; }
    public required string Message { get; init; }
    public string ConfirmText { get; init; } = "Confirm";
    public string CancelText { get; init; } = "Cancel";
    public bool Dangerous { get; init; }
    public AppDialogMode Mode { get; init; } = AppDialogMode.Warning;
    public bool PreventDismissOnOutsideClick { get; init; }
}
