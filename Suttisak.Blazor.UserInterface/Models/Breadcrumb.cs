using Microsoft.FluentUI.AspNetCore.Components;

namespace Suttisak.Blazor.UserInterface.Models;

public class Breadcrumb(Icon? icon, string? url, string titleKey)
{
    public Icon? Icon { get; } = icon;
    public string? Url { get; } = url;
    public string TitleKey { get; } = titleKey;
}