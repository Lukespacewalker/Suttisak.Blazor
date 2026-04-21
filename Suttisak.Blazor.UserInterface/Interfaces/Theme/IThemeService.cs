namespace Suttisak.Blazor.UserInterface.Interfaces.Theme;

public interface IThemeService
{
    DesignThemeMode ThemeConfiguration { get; set; }
    ThemeMode CurrentThemeMode { get; set; }
    event EventHandler<DesignThemeMode>? ThemeConfigurationChanged;
    event EventHandler<ThemeMode>? CurrentThemeChanged;
}