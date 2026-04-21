using Suttisak.Blazor.UserInterface.Interfaces.Theme;

namespace Suttisak.Blazor.UserInterface.Services;

public class ThemeService : IThemeService
{
    public DesignThemeMode ThemeConfiguration
    {
        get;
        set
        {
            field = value;
            ThemeConfigurationChanged?.Invoke(this, field);
        }
    } = DesignThemeMode.System;

    public ThemeMode CurrentThemeMode
    {
        get;
        set
        {
            field = value;
            CurrentThemeChanged?.Invoke(this, field);
        }
    }

    public event EventHandler<DesignThemeMode>? ThemeConfigurationChanged;
    public event EventHandler<ThemeMode>? CurrentThemeChanged;
}