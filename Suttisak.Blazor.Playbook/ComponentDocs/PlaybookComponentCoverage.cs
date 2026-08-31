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
                ["The /landing route contains MarketingPage with a skip target and one main landmark."],
                ["MarketingHero", "MarketingContainer", "LandingLayout"]),
            ["AccessPageLayout"] = Pattern(
                "AccessPageLayout owns the access page's main landmark, heading relationship, and complementary showcase composition.",
                "access/login",
                ["Compose the access main, heading, controls, body, and showcase aside.", "Preserve one labelled h1 and responsive two-column-to-stacked behavior."],
                ["Brand, localized copy, authentication methods, form behavior, and showcase content."],
                ["The /access/login route contains password, provider, and passkey examples inside this layout."],
                ["IdentityLayout", "CultureSelector", "ThemeSwitcher"]),
            ["ApplicationShell"] = Pattern(
                "ApplicationShell owns skip navigation, the application header, primary aside, mobile scrim, and the page main landmark.",
                "application-shell",
                ["Coordinate header, navigation, responsive menu controls, skip link, heading slot, and main content.", "Keep desktop collapse and mobile containment semantics connected through stable IDs."],
                ["Brand, routes, navigation information architecture, profile, preferences, and page content."],
                ["The /application-shell route exercises desktop and mobile navigation, focus, active routes, and breadcrumbs."],
                ["MainLayout", "Nav", "PageHeading"]),
            ["ApplicationPageHeading"] = Pattern(
                "ApplicationPageHeading combines breadcrumbs with the heading content supplied by the page.",
                "application-shell",
                ["Render breadcrumb navigation only when items exist.", "Keep the visual heading slot available with or without breadcrumbs."],
                ["Breadcrumb data, localized navigation label, heading level, page title, and page actions."],
                ["ApplicationPageHeadingTests covers empty and populated breadcrumb states.", "The /application-shell route displays the heading inside the shell."],
                ["ApplicationShell", "AppBreadcrumb", "PageHeading"]),
            ["HeaderFooterLayout"] = Pattern(
                "HeaderFooterLayout is a router-level layout with section outlets and a page main; rendering it in Component Detail would duplicate page structure.",
                "layout-patterns/header-footer",
                ["Provide the sticky application header, header section outlet, user controls, and body main.", "Nest safely under RootLayout."],
                ["Logo source, header section content, authentication endpoints, profile image, and page body."],
                ["The header/footer layout route renders the LayoutComponentBase implementation."],
                ["RootLayout", "PreferencesSelector", "ProfileMenu"]),
            ["IdentityLayout"] = Pattern(
                "IdentityLayout is a router-level section composition that executes AccessPageLayout and owns authentication-page structure.",
                "layout-patterns/identity",
                ["Map identity section outlets into AccessPageLayout slots.", "Provide culture and theme controls in the access card."],
                ["Identity form, brand, localized title and introduction, showcase, and authentication behavior."],
                ["The identity layout route fills every named section in the layout."],
                ["RootLayout", "AccessPageLayout", "PreferencesSelector"]),
            ["LandingLayout"] = Pattern(
                "LandingLayout is a router-level header and section-outlet contract. Its body must supply the page's main landmark.",
                "layout-patterns/landing",
                ["Compose the sticky landing header, brand, navigation outlet, user controls, and body flow.", "Leave the main landmark to MarketingPage or the application body."],
                ["Brand label, navigation destinations, authentication controls, and marketing body."],
                ["The landing layout route wraps a MarketingPage main landmark."],
                ["RootLayout", "MarketingPage", "HeaderControlWithUser"]),
            ["MainLayout"] = Pattern(
                "MainLayout is the application router layout. It owns section outlets, breadcrumb state, and an ApplicationShell page composition.",
                "layout-patterns/application",
                ["Populate ApplicationShell slots from named sections.", "Cascade breadcrumb population and clear stale breadcrumbs on navigation."],
                ["Brand, routes, navigation groups, page heading, messages, profile endpoints, and body content."],
                ["The application layout route covers navigation, breadcrumbs, and the mobile shell."],
                ["RootLayout", "ApplicationShell", "PageBreadcrumbs"]),
            ["RootLayout"] = Pattern(
                "RootLayout is the outer router layout for time-zone initialization, body composition, and the Blazor error surface.",
                "layout-patterns/application",
                ["Initialize browser time-zone state once per application scope.", "Wrap the routed layout body and provide the recoverable error UI."],
                ["The selected child layout, route tree, host bootstrap, and error logging policy."],
                ["Each layout-pattern route uses RootLayout as its outer layout."],
                ["InitializeTimeZone", "MainLayout", "IdentityLayout"]),
            ["HeaderControlWithUser"] = Pattern(
                "HeaderControlWithUser composes preferences and identity actions whose authenticated and anonymous states require an application header context.",
                "layout-patterns/header-footer",
                ["Place preference controls beside the signed-in profile menu or anonymous login action.", "Optionally hide the full control group at mobile breakpoints."],
                ["Login endpoint, localized labels, profile image, authentication state, and responsive placement."],
                ["The header/footer layout route renders the control through HeaderFooterLayout."],
                ["HeaderFooterLayout", "PreferencesSelector", "ProfileMenu"]),
            ["ShellProfileControl"] = Pattern(
                "ShellProfileControl is the compact account control used inside ApplicationShell and changes composition with authentication state.",
                "application-shell",
                ["Render the profile disclosure for authenticated users and a compact login link for anonymous users."],
                ["Authentication state, login endpoint, localized labels, profile image, and surrounding shell navigation."],
                ["The /application-shell route renders the control inside MainLayout and the shell account region."],
                ["ApplicationShell", "ProfileMenu", "MobileNavigationAccount"]),
            ["StatusRouteContent"] = Pattern(
                "StatusRouteContent resolves status-specific copy and actions, then composes StatusPage with routing and application option services.",
                "access/custom-error",
                ["Resolve the active status-page options.", "Map status codes to visual variants and expose request references according to policy."],
                ["Brand, status copy, action destinations, request-ID policy, and retry behavior."],
                ["StatusPageTests covers option resolution and request references.", "The custom-error route displays selectable status codes."],
                ["StatusPage", "ParameterizedStatusRouteAdapter", "AppLogo"]),
            ["HeaderControl"] = Reference(
                "HeaderControl is a minimal region adapter that renders PreferencesSelector. Its useful behavior is the parent preference component rather than a separate visual contract.",
                "components/preferences-selector",
                "View preference example",
                ["Place the shared preference selector in legacy header regions."],
                ["The consuming header owns placement, landmark structure, and account controls."],
                ["The PreferencesSelector workbench covers the preference controls."],
                ["PreferencesSelector", "HeaderControlWithUser", "HeaderFooterLayout"]),
            ["AppInputSupport"] = Reference(
                "AppInputSupport is the internal description and validation-message child used by form controls. A standalone preview would omit the aria-describedby relationship that gives it meaning.",
                "components/app-text-box",
                "Open a parent input workbench",
                ["Render a stable description ID and optional validation alert for an owning input."],
                ["Description text, validation messages, and whether inline validation is shown."],
                ["InfrastructureReferenceTests covers the AppTextBox description relationship.", "Form composition browser tests cover validation alerts and aria-invalid state."],
                ["AppTextBox", "AppSelect", "FormValidationSummary"]),
            ["AppOverlayHost"] = Reference(
                "AppOverlayHost is a queue-consuming service host. Consumers interact with AppOverlayService and the resulting dialog or drawer, not with the host component itself.",
                "components/app-dialog",
                "Open an overlay workbench",
                ["Attach to the overlay queue, render one active request, and complete or fault queued tasks.", "Cascade controllers into dynamic overlay bodies."],
                ["When to request an overlay, its content, result handling, and application workflow."],
                ["AppOverlayHostTests verifies queued dynamic drawer rendering.", "AppDrawer browser tests cover X, Escape, and protected-backdrop dismissal behavior."],
                ["AppDialog", "AppDrawer", "AppButton"]),
            ["LayoutMobileMenuButtonWrapper"] = Reference(
                "LayoutMobileMenuButtonWrapper is a legacy adapter for cascading NavComponentState. It only works inside a parent navigation layout.",
                null,
                "",
                ["Translate NavComponentState into the mobile menu button label, expanded state, and toggle action.", "Detach the state-change subscription when disposed."],
                ["The parent layout owns NavComponentState lifetime and the menu panel controlled by the button."],
                ["InfrastructureReferenceTests covers state toggling, expanded semantics, and label changes through the cascade."],
                ["Nav", "NavComponentState", "ApplicationShell"]),
            ["ParameterizedStatusRouteAdapter"] = Reference(
                "ParameterizedStatusRouteAdapter is the generated-route bridge that forwards a bound status code into StatusRouteContent. It has no independent visual surface.",
                "access/custom-error",
                "View status-page example",
                ["Accept the route or middleware status-code parameter and render StatusRouteContent with the current request identifier."],
                ["Route templates, middleware re-execution, status options, and host error handling."],
                ["The status route generator smoke tests verify generated adapters inherit this contract.", "The custom-error route demonstrates the resulting StatusRouteContent composition."],
                ["StatusRouteContent", "StatusPage", "RootLayout"])
        };

    public static PlaybookComponentCoverageSummary Summary { get; } = CreateSummary(PlaybookComponentCatalog.All);

    public static PlaybookCoverageDocumentation? DocumentationFor(PlaybookComponentDefinition component) =>
        Documentation.GetValueOrDefault(component.Name);

    public static PlaybookComponentCoverageKind KindFor(PlaybookComponentDefinition component) => component.Coverage;

    public static string LabelFor(PlaybookComponentDefinition component) => LabelFor(KindFor(component));

    public static string LabelFor(PlaybookComponentCoverageKind kind) => kind switch
    {
        PlaybookComponentCoverageKind.Interactive => "Interactive",
                PlaybookComponentCoverageKind.Pattern => "Pattern docs",
        _ => "Reference"
    };

    public static string SlugFor(PlaybookComponentDefinition component) => SlugFor(KindFor(component));

    public static string SlugFor(PlaybookComponentCoverageKind kind) => kind.ToString().ToLowerInvariant();

    public static string DescriptionFor(PlaybookComponentDefinition component) => KindFor(component) switch
    {
        PlaybookComponentCoverageKind.Interactive => "Includes an interactive specimen, viewport previews, API metadata, and accessibility notes.",
        PlaybookComponentCoverageKind.Pattern => "Documented through a page pattern because the component depends on surrounding application structure.",
        _ => "Includes API metadata, related components, and notes about where the component is used."
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
        new(rationale, route, "View page example", composition, application, evidence, related);

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
