using Microsoft.FluentUI.AspNetCore.Components;

namespace Suttisak.Blazor.UserInterface.Models;

public class Breadcrumb(Icon? icon, string? url, string title)
{
    public Icon? Icon { get; } = icon;
    public string? Url { get; } = url;
    public string Title { get; } = title;

    [Obsolete("Use Title. Breadcrumb titles are resolved by the consuming application before rendering.")]
    public string TitleKey => Title;
}
