namespace Suttisak.Blazor.Playbook;

public sealed class PlaybookState
{
    private string _theme = "audiogramiq";
    private string _mode = "light";
    private string _viewport = "wide";
    private string _language = "en";

    public event Action? Changed;

    public string Theme { get => _theme; set => Set(ref _theme, value); }
    public string Mode { get => _mode; set => Set(ref _mode, value); }
    public string Viewport { get => _viewport; set => Set(ref _viewport, value); }
    public string Language { get => _language; set => Set(ref _language, value); }

    private void Set(ref string field, string value)
    {
        if (field == value) return;
        field = value;
        Changed?.Invoke();
    }
}

public static class PlaybookCatalog
{
    public static readonly PlaybookTheme[] Themes =
    [
        new("audiogramiq", "AudiogramIQ", "AUDIO", "#08777d", "app-assets/audiogramiq/logo.webp", "app-assets/audiogramiq/hero.webp", "Audiometry specialist working with a hearing test device", false),
        new("bafsworkout", "BafsWorkout", "BAFS FIT", "#51398a", "app-assets/bafsworkout/logo.webp", "app-assets/bafsworkout/hero.webp", "BAFS fitness testing on a rooftop training area", true),
        new("coekpi", "CoeKPI", "COE KPI", "#0b5fac", "app-assets/coekpi/logo.webp", "app-assets/coekpi/hero.webp", "CoeKPI team at a strategic planning workshop", true),
        new("ergotrack", "ErgoTrack", "ERGO", "#49358f", "app-assets/ergotrack/logo.webp", "app-assets/ergotrack/hero.webp", "Office worker seated at an ergonomic workstation", false),
        new("mentalinsight", "MentalInsight", "MIND", "#b32255", "app-assets/mentalinsight/logo.webp", "app-assets/mentalinsight/hero.webp", "Mental wellbeing professional reviewing an assessment", true),
        new("healthinsight", "HealthInsight", "HEALTH", "#0869b5", "app-assets/healthinsight/logo.webp", "app-assets/healthinsight/hero.webp", "Clinician reviewing an occupational health dashboard", false)
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
    string HeroPath,
    string HeroAlt,
    bool CropHero);
