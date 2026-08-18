namespace Suttisak.Blazor.UserInterface.Models;

public class Breadcrumb(string? iconName, string? url, string title)
{
    public string? IconName { get; } = iconName;

    public static Breadcrumb FromIconName(string? iconName, string? url, string title) => new(iconName, url, title);
    public string? Url { get; } = url;
    public string Title { get; } = title;

    [Obsolete("Use Title. Breadcrumb titles are resolved by the consuming application before rendering.")]
    public string TitleKey => Title;
}
