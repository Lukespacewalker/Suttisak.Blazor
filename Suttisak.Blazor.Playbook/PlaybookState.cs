namespace Suttisak.Blazor.Playbook;

public sealed class PlaybookState
{
    public string Theme { get; set; } = "audiogramiq";
    public string Mode { get; set; } = "light";
    public string Viewport { get; set; } = "wide";
}

public static class PlaybookCatalog
{
    public static readonly PlaybookTheme[] Themes =
    [
        new("audiogramiq", "AudiogramIQ", "AUDIO", "#096f86"),
        new("bafsworkout", "BafsWorkout", "BAFS FIT", "#4a3a8a"),
        new("coekpi", "CoeKPI", "COE KPI", "#155da5"),
        new("ergotrack", "ErgoTrack", "ERGO", "#4d3da7"),
        new("mentalinsight", "MentalInsight", "MIND", "#67306f"),
        new("healthinsight", "HealthInsight", "HEALTH", "#0876c9")
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

public sealed record PlaybookTheme(string Key, string Name, string ShortName, string PrimaryColor);
