using Microsoft.FluentUI.AspNetCore.Components;
using Suttisak.Blazor.UserInterface.Interfaces.Theme;

namespace Suttisak.Blazor.UserInterface.Services;

public class ThemeService : IThemeService
{
    public DesignThemeModes ThemeConfiguration
    {
        get;
        set
        {
            field = value;
            ThemeConfigurationChanged?.Invoke(this, field);
        }
    } = DesignThemeModes.System;

    public ThemeMode CurrentThemeMode
    {
        get;
        set
        {
            field = value;
            CurrentThemeChanged?.Invoke(this, field);
        }
    }

    public event EventHandler<DesignThemeModes>? ThemeConfigurationChanged;
    public event EventHandler<ThemeMode>? CurrentThemeChanged;
}