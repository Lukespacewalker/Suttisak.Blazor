using Suttisak.Blazor.UserInterface.Interfaces.Theme;

namespace Suttisak.Blazor.UserInterface.Services;

public class ThemeService : IThemeService
{
    private DesignThemeMode _themeConfiguration = DesignThemeMode.System;
    private ThemeMode _currentThemeMode = ThemeMode.Light;

    public DesignThemeMode ThemeConfiguration
    {
        get => _themeConfiguration;
        set
        {
            if (_themeConfiguration == value) return;
            _themeConfiguration = value;
            ThemeConfigurationChanged?.Invoke(this, value);
        }
    }

    public ThemeMode CurrentThemeMode
    {
        get => _currentThemeMode;
        set
        {
            if (_currentThemeMode == value) return;
            _currentThemeMode = value;
            CurrentThemeChanged?.Invoke(this, value);
        }
    }

    public event EventHandler<DesignThemeMode>? ThemeConfigurationChanged;
    public event EventHandler<ThemeMode>? CurrentThemeChanged;

    public void SetTheme(DesignThemeMode configuration, ThemeMode currentThemeMode)
    {
        ThemeConfiguration = configuration;
        CurrentThemeMode = currentThemeMode;
    }
}
