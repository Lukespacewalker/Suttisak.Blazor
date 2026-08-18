namespace Suttisak.Blazor.UserInterface.Interfaces.Theme;

public interface IThemeService
{
    DesignThemeMode ThemeConfiguration { get; set; }
    ThemeMode CurrentThemeMode { get; set; }
    event EventHandler<DesignThemeMode>? ThemeConfigurationChanged;
    event EventHandler<ThemeMode>? CurrentThemeChanged;

    /// <summary>Updates the preference and its resolved scheme together.</summary>
    void SetTheme(DesignThemeMode configuration, ThemeMode currentThemeMode);
}
