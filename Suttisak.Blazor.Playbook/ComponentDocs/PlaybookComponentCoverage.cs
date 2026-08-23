namespace Suttisak.Blazor.Playbook.ComponentDocs;

public enum PlaybookComponentCoverageKind
{
    Interactive,
    Pattern,
    Reference
}

public sealed record PlaybookComponentCoverageSummary(
    int Total,
    int Interactive,
    int Pattern,
    int Reference)
{
    public int Documented => Interactive + Pattern + Reference;
    public decimal InteractivePercent => Total == 0 ? 0 : decimal.Round(Interactive * 100m / Total, 1);
}

public static class PlaybookComponentCoverage
{
    public static PlaybookComponentCoverageSummary Summary { get; } = CreateSummary(PlaybookComponentCatalog.All);

    public static PlaybookComponentCoverageKind KindFor(PlaybookComponentDefinition component)
    {
        if (PlaybookSpecimenRegistry.TryGet(component.Name, out _))
        {
            return PlaybookComponentCoverageKind.Interactive;
        }

        return component.HasPatternPage
            ? PlaybookComponentCoverageKind.Pattern
            : PlaybookComponentCoverageKind.Reference;
    }

    public static string LabelFor(PlaybookComponentDefinition component) => LabelFor(KindFor(component));

    public static string LabelFor(PlaybookComponentCoverageKind kind) => kind switch
    {
        PlaybookComponentCoverageKind.Interactive => "Interactive",
        PlaybookComponentCoverageKind.Pattern => "Pattern",
        _ => "Reference"
    };

    public static string SlugFor(PlaybookComponentDefinition component) => SlugFor(KindFor(component));

    public static string SlugFor(PlaybookComponentCoverageKind kind) => kind.ToString().ToLowerInvariant();

    public static string DescriptionFor(PlaybookComponentDefinition component) => KindFor(component) switch
    {
        PlaybookComponentCoverageKind.Interactive => "Executable specimen, responsive preview, runtime API metadata, and accessibility guidance.",
        PlaybookComponentCoverageKind.Pattern => "Documented in a production-shaped integration page because the contract depends on surrounding application composition.",
        _ => "Catalogued reference with maturity, API metadata when available, relationships, and a deliberate path to a future executable specimen."
    };

    public static PlaybookComponentCoverageSummary CreateSummary(IEnumerable<PlaybookComponentDefinition> components)
    {
        var items = components.ToArray();
        var interactive = items.Count(component => KindFor(component) == PlaybookComponentCoverageKind.Interactive);
        var pattern = items.Count(component => KindFor(component) == PlaybookComponentCoverageKind.Pattern);
        var reference = items.Length - interactive - pattern;

        return new(items.Length, interactive, pattern, reference);
    }
}
