using Microsoft.FluentUI.AspNetCore.Components;

namespace Suttisak.BlazorUI.Interfaces.Theme;

public interface IThemeService
{
    DesignThemeModes ThemeConfiguration { get; set; }
    ThemeMode CurrentThemeMode { get; set; }
    event EventHandler<DesignThemeModes>? ThemeConfigurationChanged;
    event EventHandler<ThemeMode>? CurrentThemeChanged;
}