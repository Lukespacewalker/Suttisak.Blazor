namespace Suttisak.Blazor.Playbook;

public sealed class PlaybookState
{
    private static readonly string[] Modes = ["light", "dark", "auto"];
    private static readonly string[] Viewports = ["wide", "narrow"];

    private string _theme = "audiogramiq";
    private string _mode = "light";
    private string _viewport = "wide";
    private string _language = "en";

    public event Action? Changed;

    public string Theme { get => _theme; set => Set(ref _theme, value); }
    public string Mode { get => _mode; set => Set(ref _mode, value); }
    public string Viewport { get => _viewport; set => Set(ref _viewport, value); }
    public string Language { get => _language; set => Set(ref _language, value); }

    public bool TrySetTheme(string? value)
    {
        var theme = PlaybookCatalog.Themes.FirstOrDefault(theme =>
            string.Equals(theme.Key, value, StringComparison.OrdinalIgnoreCase));
        if (theme is null) return false;

        Theme = theme.Key;
        return true;
    }

    public bool TrySetMode(string? value) => TrySetKnownValue(value, Modes, mode => Mode = mode);

    public bool TrySetViewport(string? value) => TrySetKnownValue(value, Viewports, viewport => Viewport = viewport);

    private void Set(ref string field, string value)
    {
        if (field == value) return;
        field = value;
        Changed?.Invoke();
    }

    private static bool TrySetKnownValue(string? value, IEnumerable<string> candidates, Action<string> setter)
    {
        var candidate = candidates.FirstOrDefault(candidate =>
            string.Equals(candidate, value, StringComparison.OrdinalIgnoreCase));
        if (candidate is null) return false;

        setter(candidate);
        return true;
    }
}

public static class PlaybookCatalog
{
    public static readonly PlaybookTheme[] Themes =
    [
        new("audiogramiq", "AudiogramIQ", "AUDIO", "#08777d", "app-assets/audiogramiq/logo.webp", 256, 256, "app-assets/audiogramiq/hero.webp", 1004, 1533, "Audiometry specialist working with a hearing test device", false),
        new("bafsworkout", "BafsWorkout", "BAFS FIT", "#51398a", "app-assets/bafsworkout/logo.webp", 256, 256, "app-assets/bafsworkout/hero.webp", 1200, 896, "BAFS fitness testing on a rooftop training area", true),
        new("coekpi", "CoeKPI", "COE KPI", "#0b5fac", "app-assets/coekpi/logo.webp", 256, 256, "app-assets/coekpi/hero.webp", 1776, 1184, "CoeKPI team at a strategic planning workshop", true),
        new("ergotrack", "ErgoTrack", "ERGO", "#49358f", "app-assets/ergotrack/logo.webp", 256, 256, "app-assets/ergotrack/hero.webp", 1448, 1086, "Office worker seated at an ergonomic workstation", false),
        new("mentalinsight", "MentalInsight", "MIND", "#b32255", "app-assets/mentalinsight/logo.webp", 256, 256, "app-assets/mentalinsight/hero.webp", 1536, 1024, "Mental wellbeing professional reviewing an assessment", true),
        new("healthinsight", "HealthInsight", "HEALTH", "#0869b5", "app-assets/healthinsight/logo.webp", 512, 512, "app-assets/healthinsight/hero.webp", 1536, 1024, "Clinician reviewing an occupational health dashboard", false)
    ];

    public static readonly string[] ColorTokens =
    [
        "--app-brand", "--app-on-brand", "--app-brand-secondary", "--app-accent",
        "--app-accent-soft", "--app-accent-border", "--app-brand-soft", "--app-brand-secondary-soft",
        "--app-background", "--app-surface", "--app-surface-muted", "--app-surface-hover",
        "--app-glass-surface", "--app-glass-surface-strong", "--app-glass-border", "--app-glass-shadow",
        "--app-foreground", "--app-foreground-muted", "--app-border", "--app-grid-line", "--app-shadow-color",
        "--app-success", "--app-success-soft", "--app-success-border",
        "--app-warning", "--app-warning-soft", "--app-warning-border",
        "--app-danger", "--app-danger-soft", "--app-danger-border"
    ];
}

public sealed record PlaybookTheme(
    string Key,
    string Name,
    string ShortName,
    string PrimaryColor,
    string LogoPath,
    int LogoWidth,
    int LogoHeight,
    string HeroPath,
    int HeroWidth,
    int HeroHeight,
    string HeroAlt,
    bool CropHero);
