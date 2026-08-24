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

public sealed record PlaybookCoverageDocumentation(
    string Rationale,
    string? IntegrationRoute,
    string IntegrationRouteLabel,
    IReadOnlyList<string> CompositionResponsibilities,
    IReadOnlyList<string> ApplicationResponsibilities,
    IReadOnlyList<string> RegressionEvidence,
    IReadOnlyList<string> RelatedComponents);

public static class PlaybookComponentCoverage
{
    private static readonly IReadOnlyDictionary<string, PlaybookCoverageDocumentation> Documentation =
        new Dictionary<string, PlaybookCoverageDocumentation>(StringComparer.OrdinalIgnoreCase)
        {
            ["MarketingPage"] = Pattern(
                "MarketingPage owns the document's main landmark and skip-link target. Executing it inside Component Detail would create a nested main landmark.",
                "landing",
                ["Own the marketing main landmark and stable content ID.", "Place the optional skip link before page content.", "Provide one flow container for application-composed marketing sections."],
                ["Product copy, media, routes, analytics, and section ordering.", "The skip destination and every section landmark inside the page."],
                ["The /landing route renders the real MarketingPage with a skip target and one main landmark."],
                ["MarketingHero", "MarketingContainer", "LandingLayout"]),
            ["AccessPageLayout"] = Pattern(
                "AccessPageLayout owns the access page's main landmark, heading relationship, and complementary showcase composition.",
                "access/login",
                ["Compose the access main, heading, controls, body, and showcase aside.", "Preserve one labelled h1 and responsive two-column-to-stacked behavior."],
                ["Brand, localized copy, authentication methods, form behavior, and showcase content."],
                ["The /access/login route renders the real layout around password, provider, and passkey examples."],
                ["IdentityLayout", "CultureSelector", "ThemeSwitcher"]),
            ["ApplicationShell"] = Pattern(
                "ApplicationShell owns skip navigation, the application header, primary aside, mobile scrim, and the page main landmark.",
                "application-shell",
                ["Coordinate header, navigation, responsive menu controls, skip link, heading slot, and main content.", "Keep desktop collapse and mobile containment semantics connected through stable IDs."],
                ["Brand, routes, navigation information architecture, profile, preferences, and page content."],
                ["The /application-shell route exercises desktop and mobile navigation, focus, active routes, and breadcrumbs."],
                ["MainLayout", "Nav", "PageHeading"]),
            ["HeaderFooterLayout"] = Pattern(
                "HeaderFooterLayout is a router-level layout with section outlets and a page main; rendering it in Component Detail would duplicate page structure.",
                "layout-patterns/header-footer",
                ["Provide the sticky application header, header section outlet, user controls, and body main.", "Nest safely under RootLayout."],
                ["Logo source, header section content, authentication endpoints, profile image, and page body."],
                ["The dedicated header/footer layout route executes the real LayoutComponentBase contract."],
                ["RootLayout", "PreferencesSelector", "ProfileMenu"]),
            ["IdentityLayout"] = Pattern(
                "IdentityLayout is a router-level section composition that executes AccessPageLayout and owns authentication-page structure.",
                "layout-patterns/identity",
                ["Map identity section outlets into AccessPageLayout slots.", "Provide culture and theme controls in the access card."],
                ["Identity form, brand, localized title and introduction, showcase, and authentication behavior."],
                ["The dedicated identity layout route renders the real layout with every named section populated."],
                ["RootLayout", "AccessPageLayout", "PreferencesSelector"]),
            ["LandingLayout"] = Pattern(
                "LandingLayout is a router-level header and section-outlet contract. Its body must supply the page's main landmark.",
                "layout-patterns/landing",
                ["Compose the sticky landing header, brand, navigation outlet, user controls, and body flow.", "Remain landmark-safe by leaving main ownership to MarketingPage or the application body."],
                ["Brand label, navigation destinations, authentication controls, and marketing body."],
                ["The dedicated landing layout route uses LandingLayout around a real MarketingPage main."],
                ["RootLayout", "MarketingPage", "HeaderControlWithUser"]),
            ["MainLayout"] = Pattern(
                "MainLayout is the application router layout. It owns section outlets, breadcrumb state, and an ApplicationShell page composition.",
                "layout-patterns/application",
                ["Populate ApplicationShell slots from named sections.", "Cascade breadcrumb population and clear stale breadcrumbs on navigation."],
                ["Brand, routes, navigation groups, page heading, messages, profile endpoints, and body content."],
                ["The dedicated application layout route exercises the real layout, current navigation, breadcrumbs, and mobile shell."],
                ["RootLayout", "ApplicationShell", "PageBreadcrumbs"]),
            ["RootLayout"] = Pattern(
                "RootLayout is the outer router layout for time-zone initialization, body composition, and the Blazor error surface.",
                "layout-patterns/application",
                ["Initialize browser time-zone state once per application scope.", "Wrap the routed layout body and provide the recoverable error UI."],
                ["The selected child layout, route tree, host bootstrap, and error logging policy."],
                ["Every dedicated layout-pattern route executes RootLayout as its outer layout."],
                ["InitializeTimeZone", "MainLayout", "IdentityLayout"]),
            ["AppInputSupport"] = Reference(
                "AppInputSupport is the internal description and validation-message child used by form controls. A standalone preview would omit the aria-describedby relationship that gives it meaning.",
                "components/app-text-box",
                "Open a parent input workbench",
                ["Render a stable description ID and optional validation alert for an owning input."],
                ["Description text, validation messages, and whether inline validation is shown."],
                ["InfrastructureReferenceTests verifies the real AppTextBox description relationship.", "Form composition browser tests cover validation alerts and aria-invalid state."],
                ["AppTextBox", "AppSelect", "FormValidationSummary"]),
            ["AppOverlayHost"] = Reference(
                "AppOverlayHost is a queue-consuming service host. Consumers interact with AppOverlayService and the resulting dialog or drawer, not with the host component itself.",
                "components/app-dialog",
                "Open an overlay workbench",
                ["Attach to the overlay queue, render one active request, and complete or fault queued tasks.", "Cascade controllers into dynamic overlay bodies."],
                ["When to request an overlay, its content, result handling, and application workflow."],
                ["AppOverlayHostTests verifies queued dynamic drawer rendering.", "AppDrawer browser tests verify action-only dismissal, including Escape and backdrop protection."],
                ["AppDialog", "AppDrawer", "AppButton"]),
            ["LayoutMobileMenuButtonWrapper"] = Reference(
                "LayoutMobileMenuButtonWrapper is a legacy cascading-state adapter. Without NavComponentState it has no honest standalone behavior or production route.",
                null,
                "",
                ["Translate NavComponentState into the mobile menu button label, expanded state, and toggle action.", "Detach the state-change subscription when disposed."],
                ["The parent layout owns NavComponentState lifetime and the menu panel controlled by the button."],
                ["InfrastructureReferenceTests verifies state toggling, expanded semantics, and label changes through the real cascade."],
                ["Nav", "NavComponentState", "ApplicationShell"])
        };

    public static PlaybookComponentCoverageSummary Summary { get; } = CreateSummary(PlaybookComponentCatalog.All);

    public static PlaybookCoverageDocumentation? DocumentationFor(PlaybookComponentDefinition component) =>
        Documentation.GetValueOrDefault(component.Name);

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

    private static PlaybookCoverageDocumentation Pattern(
        string rationale,
        string route,
        IReadOnlyList<string> composition,
        IReadOnlyList<string> application,
        IReadOnlyList<string> evidence,
        IReadOnlyList<string> related) =>
        new(rationale, route, "Open the canonical full-page route", composition, application, evidence, related);

    private static PlaybookCoverageDocumentation Reference(
        string rationale,
        string? route,
        string routeLabel,
        IReadOnlyList<string> composition,
        IReadOnlyList<string> application,
        IReadOnlyList<string> evidence,
        IReadOnlyList<string> related) =>
        new(rationale, route, routeLabel, composition, application, evidence, related);
}
