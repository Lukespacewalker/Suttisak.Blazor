using Microsoft.AspNetCore.Components;
using Suttisak.Blazor.UserInterface.Components.Marketing;
using Suttisak.Blazor.UserInterface.Components.Navigation;
using Suttisak.Blazor.UserInterface.Components.Common;
using Suttisak.Blazor.UserInterface.Layouts.Shared;
using Suttisak.Blazor.UserInterface.Region;
using Suttisak.Blazor.UserInterface.Routing;

namespace Suttisak.Blazor.Playbook.ComponentDocs;

public enum PlaybookComponentStatus
{
    Stable,
    Beta,
    Experimental,
    Deprecated
}

public sealed record PlaybookComponentDefinition(
    string Name,
    string Slug,
    string Category,
    string Summary,
    PlaybookComponentStatus Status,
    PlaybookComponentCoverageKind Coverage,
    string ExistingHref,
    string SourceArea,
    IReadOnlyList<string> Tags,
    Type? RuntimeType = null)
{
    public string DetailHref => $"components/{Slug}";
    public bool HasLiveSpecimen => Coverage == PlaybookComponentCoverageKind.Interactive;
    public bool HasPatternPage => Coverage == PlaybookComponentCoverageKind.Pattern;
    public IReadOnlyList<string> RelatedPatternIds =>
        PlaybookPatternCatalog.PatternsForComponent(Name).Select(pattern => pattern.Slug).ToArray();
}

public static class PlaybookComponentCatalog
{
    private const PlaybookComponentCoverageKind Interactive = PlaybookComponentCoverageKind.Interactive;
    private const PlaybookComponentCoverageKind Pattern = PlaybookComponentCoverageKind.Pattern;
    private const PlaybookComponentCoverageKind Reference = PlaybookComponentCoverageKind.Reference;

    private static readonly IReadOnlyDictionary<string, string> Summaries =
        new Dictionary<string, string>(StringComparer.Ordinal)
        {
            ["AppTextBox"] = "Single-line text input with shared labels, descriptions, validation, and focus behavior.",
            ["AppTextArea"] = "Multiline text input with the same accessible support contract as other form controls.",
            ["AppNumberInput"] = "Generic numeric input that binds typed values while preserving shared form semantics.",
            ["AppSelect"] = "Typed single-choice select with application-owned options and integrated validation support.",
            ["AppSelectItem"] = "Typed option definition consumed by AppSelect to describe one selectable value.",
            ["AppMultiSelect"] = "Typed multiple-choice control for selecting and reviewing more than one value.",
            ["AppRadioGroup"] = "Typed radio-group owner that coordinates labels, validation, and the selected value.",
            ["AppRadio"] = "One typed radio choice designed to participate in an AppRadioGroup contract.",
            ["AppCheckbox"] = "Boolean checkbox with shared label, description, validation, and disabled-state treatment.",
            ["AppSwitch"] = "Boolean switch for immediate settings whose state remains clear to assistive technology.",
            ["AppCalendarPicker"] = "Calendar-based date picker with typed binding and keyboard-aware date selection.",
            ["AppTimePicker"] = "Time-of-day picker that exposes a consistent typed form-control contract.",
            ["AppDateTimePicker"] = "Combined date-and-time picker for workflows that require one coordinated value.",
            ["FormSection"] = "Semantic form grouping with a heading, optional introduction, and structured child content.",
            ["FormGrid"] = "Responsive field grid that collapses form columns when the actual viewport is constrained.",
            ["FormField"] = "Layout wrapper that aligns one label-and-control unit within composed forms.",
            ["FormActions"] = "Action row that positions primary and supporting form operations consistently.",
            ["FormValidationSummary"] = "Form-level validation summary that links users to errors requiring attention.",
            ["AppButton"] = "Shared button or action link with semantic variants, sizes, icons, loading, and disabled states.",
            ["AppCard"] = "General content surface with consistent border, radius, padding, and theme behavior.",
            ["AppDivider"] = "Semantic visual separator for dividing related regions without application-specific styling.",
            ["AppStack"] = "Flow layout primitive that applies consistent spacing between composed children.",
            ["CardMenu"] = "Compact action menu surface intended for contextual operations associated with a card.",
            ["CompanyFooter"] = "Reusable company-footer composition for organization identity and supporting links.",
            ["Hero"] = "Application hero surface for a prominent heading, explanation, and supporting content.",
            ["Pill"] = "Compact badge-like label for status, metadata, or short categorical information.",
            ["Toolbar"] = "Semantic toolbar that groups a coordinated set of page or content actions.",
            ["PageActionToolbar"] = "Page-heading action region that keeps primary and secondary operations aligned.",
            ["PageHeading"] = "Page title composition with eyebrow, description, metadata, and action slots.",
            ["AppBreadcrumb"] = "Breadcrumb navigation that renders a typed trail with a distinct current location.",
            ["AppGridShell"] = "Grid framing surface that composes data controls, result context, and the table region.",
            ["AppGrid"] = "Virtualization-ready typed data grid for scalable application record collections.",
            ["AppGridPaginator"] = "Pagination controls and result context for paged AppGrid data sources.",
            ["AppGridPropertyColumn"] = "Typed AppGrid column that reads and formats one item property.",
            ["AppGridTemplateColumn"] = "Typed AppGrid column that delegates each cell to application-owned markup.",
            ["PageBreadcrumbs"] = "Page-level breadcrumb state provider used by application shell compositions.",
            ["AppLoading"] = "Accessible loading indicator for indeterminate work and deferred content transitions.",
            ["AppProgress"] = "Determinate progress indicator that communicates a known completion value.",
            ["AppSkeleton"] = "Placeholder surface that preserves content shape while data is unavailable.",
            ["AsyncContent"] = "Asynchronous content boundary that switches between loading, success, empty, and failure states.",
            ["FeedbackBanner"] = "Prominent feedback message for success, warning, informational, or error outcomes.",
            ["StatusPanel"] = "Contained status explanation with optional visual, detail, and recovery actions.",
            ["StatusPage"] = "Full-page status composition with brand, heading, visual, actions, reference, and footer slots.",
            ["StatusRouteContent"] = "Route-aware status composition that resolves configured copy and actions for an HTTP status code.",
            ["AppDialog"] = "Modal overlay contract with labelled content, focus management, and explicit dismissal behavior.",
            ["AppDrawer"] = "Edge-aligned overlay panel for contained workflows that retain the underlying page context.",
            ["AppLogo"] = "Application-owned logo slot with a legacy static-asset image fallback.",
            ["AppTabs"] = "Keyboard-aware tab list that coordinates selection and associated panel content.",
            ["AppTab"] = "One labelled tab and panel definition registered with an owning AppTabs instance.",
            ["Nav"] = "Primary application navigation container with responsive open and collapsed state coordination.",
            ["NavGroup"] = "Labelled navigation group for organizing related application destinations.",
            ["NavItem"] = "Single navigation destination with icon, label, active-state, and optional badge support.",
            ["NavSubmenu"] = "Expandable navigation branch that contains a nested set of destinations.",
            ["SectionNavigation"] = "Local section navigation for switching views within one application workspace.",
            ["MobileNavigationAccount"] = "Mobile account region that brings identity and preferences into the navigation surface.",
            ["ProfileMenu"] = "Authenticated profile disclosure with account context, preferences, and sign-out action.",
            ["HeaderControl"] = "Legacy header-region adapter that places the shared preference selector.",
            ["HeaderControlWithUser"] = "Header action group that combines preferences with authenticated or anonymous identity controls.",
            ["ShellProfileControl"] = "Compact shell account control that switches between profile disclosure and login link.",
            ["CultureSelector"] = "Culture chooser that lets an application expose its supported locales consistently.",
            ["PreferencesSelector"] = "Combined preference surface for theme, culture, and related user settings.",
            ["ThemeSwitcher"] = "Theme-mode selector for applying the shared light, dark, or system preference contract.",
            ["InitializeTimeZone"] = "Bootstrap component that discovers and initializes the browser time-zone context.",
            ["LocalTime"] = "Time display that converts an instant through the active local time-zone provider.",
            ["ExperienceCard"] = "Reader-facing card for presenting a cohesive result, explanation, or guidance block.",
            ["ExperienceDisclosure"] = "Expandable reader-facing detail that keeps optional explanation accessible on demand.",
            ["ExperienceDisclosureGroup"] = "Coordinated group of disclosures for progressively revealing related guidance.",
            ["ExperienceHeading"] = "Experience-section heading with consistent hierarchy and supporting explanation.",
            ["MarketingActionLink"] = "Styled marketing link for application-owned calls to action and destinations.",
            ["MarketingCallToAction"] = "Prominent marketing conversion block with copy, actions, and optional supporting content.",
            ["MarketingCard"] = "Composable marketing content card with application-owned message and media.",
            ["MarketingContainer"] = "Width and gutter boundary that aligns marketing sections across a page.",
            ["MarketingFeatureGrid"] = "Responsive feature layout that arranges application-composed marketing cards.",
            ["MarketingHero"] = "Above-fold marketing composition for value proposition, actions, proof, and product media.",
            ["MarketingPage"] = "Marketing page landmark and skip-target owner for a complete landing composition.",
            ["MarketingProductFrame"] = "Framed product-media surface for screenshots, previews, or application-owned demonstrations.",
            ["MarketingProofItem"] = "One compact evidence item such as a metric, credential, or customer outcome.",
            ["MarketingProofStrip"] = "Horizontal or wrapping composition of concise MarketingProofItem evidence.",
            ["MarketingSectionHeader"] = "Marketing section introduction with eyebrow, heading, and supporting copy.",
            ["MarketingStep"] = "One numbered or sequenced step in an application-owned marketing explanation.",
            ["MarketingStepList"] = "Responsive sequence that composes multiple MarketingStep instructions.",
            ["AccessPageLayout"] = "Complete access-page structure for brand, identity controls, form content, and showcase.",
            ["ApplicationShell"] = "Responsive application frame owning skip navigation, header, primary navigation, and main content.",
            ["ApplicationPageHeading"] = "Shell heading region that combines optional breadcrumbs with application-owned heading content.",
            ["HeaderFooterLayout"] = "Router layout that composes a sticky header, section outlets, and the page main region.",
            ["IdentityLayout"] = "Router layout that maps identity sections into the shared AccessPageLayout contract.",
            ["LandingLayout"] = "Router layout for a marketing header whose body retains ownership of the main landmark.",
            ["MainLayout"] = "Router layout that maps application sections, breadcrumbs, and body content into ApplicationShell.",
            ["RootLayout"] = "Outermost router layout for time-zone initialization, child layout content, and error recovery UI.",
            ["AppInputSupport"] = "Infrastructure child that renders an owning input's description and validation message relationship.",
            ["AppOverlayHost"] = "Service-backed host that dequeues and renders application-requested dialogs or drawers.",
            ["LayoutMobileMenuButtonWrapper"] = "Legacy adapter between cascading navigation state and the mobile menu button contract.",
            ["ParameterizedStatusRouteAdapter"] = "Generated-route bridge that forwards a bound status code into StatusRouteContent."
        };

    public static IReadOnlyList<PlaybookComponentDefinition> All { get; } =
    [
        // Forms & inputs
        D("AppTextBox", "Forms & inputs", Interactive, "#app-text-box", "Common", ["text", "input", "form"]),
        D("AppTextArea", "Forms & inputs", Interactive, "#app-text-area", "Common", ["text", "multiline", "form"]),
        D("AppNumberInput", "Forms & inputs", Interactive, "#app-number-input", "Common", ["number", "input", "form"]),
        D("AppSelect", "Forms & inputs", Interactive, "#app-select", "Common", ["select", "choice", "form"]),
        D("AppSelectItem", "Forms & inputs", Interactive, "#app-select", "Common", ["select", "option", "form"]),
        D("AppMultiSelect", "Forms & inputs", Interactive, "#app-multi-select", "Common", ["select", "multiple", "form"]),
        D("AppRadioGroup", "Forms & inputs", Interactive, "#app-radio-group", "Common", ["radio", "choice", "form"]),
        D("AppRadio", "Forms & inputs", Interactive, "#app-radio-group", "Common", ["radio", "choice", "form"]),
        D("AppCheckbox", "Forms & inputs", Interactive, "#app-checkbox", "Common", ["checkbox", "boolean", "form"]),
        D("AppSwitch", "Forms & inputs", Interactive, "#app-switch", "Common", ["switch", "boolean", "form"]),
        D("AppCalendarPicker", "Forms & inputs", Interactive, "#app-calendar-picker", "Common", ["date", "picker", "form"]),
        D("AppTimePicker", "Forms & inputs", Interactive, "#app-time-picker", "Common", ["time", "picker", "form"]),
        D("AppDateTimePicker", "Forms & inputs", Interactive, "#app-date-time-picker", "Common", ["date", "time", "picker"]),
        D("FormSection", "Forms & inputs", Interactive, "#form-composition", "Common", ["form", "composition", "layout"]),
        D("FormGrid", "Forms & inputs", Interactive, "#form-composition", "Common", ["form", "grid", "layout"]),
        D("FormField", "Forms & inputs", Interactive, "#form-composition", "Common", ["form", "field", "layout"]),
        D("FormActions", "Forms & inputs", Interactive, "#form-composition", "Common", ["form", "actions", "layout"]),
        D("FormValidationSummary", "Forms & inputs", Interactive, "form-controls#edit-form-title", "Common", ["form", "validation", "feedback"]),

        // Actions & surfaces
        D("AppButton", "Actions & surfaces", Interactive, "#app-button", "Common", ["button", "action", "form"], typeof(AppButton)),
        D("AppCard", "Actions & surfaces", Interactive, "#library-directory", "Common", ["card", "surface", "container"]),
        D("AppDivider", "Actions & surfaces", Interactive, "#library-directory", "Common", ["divider", "separator"]),
        D("AppStack", "Actions & surfaces", Interactive, "#library-directory", "Common", ["stack", "layout", "spacing"]),
        D("CardMenu", "Actions & surfaces", Interactive, "#library-directory", "Common", ["card", "menu", "action"]),
        D("CompanyFooter", "Actions & surfaces", Interactive, "#library-directory", "Common", ["footer", "company", "layout"]),
        D("Hero", "Actions & surfaces", Interactive, "#library-directory", "Common", ["hero", "heading", "surface"]),
        D("Pill", "Actions & surfaces", Interactive, "#library-directory", "Common", ["pill", "badge", "status"]),
        D("Toolbar", "Actions & surfaces", Interactive, "#library-directory", "Common", ["toolbar", "actions", "layout"]),
        D("PageActionToolbar", "Actions & surfaces", Interactive, "application-shell", "Common", ["toolbar", "page", "actions"]),
        D("PageHeading", "Actions & surfaces", Interactive, "application-shell", "Common", ["heading", "page", "layout"]),

        // Data & display
        D("AppBreadcrumb", "Data & display", Interactive, "#library-directory", "Common", ["breadcrumb", "navigation"]),
        D("AppGridShell", "Data & display", Interactive, "grid-performance", "Common", ["grid", "shell", "toolbar"]),
        D("AppGrid", "Data & display", Interactive, "grid-performance", "Common", ["data", "grid", "table"]),
        D("AppGridPaginator", "Data & display", Interactive, "grid-performance", "Common", ["grid", "pagination"]),
        D("AppGridPropertyColumn", "Data & display", Interactive, "grid-performance", "Common", ["grid", "column", "property"]),
        D("AppGridTemplateColumn", "Data & display", Interactive, "grid-performance", "Common", ["grid", "column", "template"]),
        D("PageBreadcrumbs", "Data & display", Interactive, "application-shell", "Common", ["breadcrumb", "page", "navigation"]),

        // Feedback & async
        D("AppLoading", "Feedback & async", Interactive, "#app-feedback", "Common", ["loading", "async", "feedback"]),
        D("AppProgress", "Feedback & async", Interactive, "#app-feedback", "Common", ["progress", "async", "feedback"]),
        D("AppSkeleton", "Feedback & async", Interactive, "#library-directory", "Common", ["skeleton", "loading", "feedback"]),
        D("AsyncContent", "Feedback & async", Interactive, "#library-directory", "Common", ["async", "loading", "content"]),
        D("FeedbackBanner", "Feedback & async", Interactive, "#app-feedback", "Common", ["banner", "feedback", "status"]),
        D("StatusPanel", "Feedback & async", Interactive, "#library-directory", "Common", ["status", "feedback", "panel"]),
        D("StatusPage", "Feedback & async", Interactive, "#status-page", "Routing", ["status", "error", "page", "composition"], typeof(StatusPage)),
        D("StatusRouteContent", "Feedback & async", Pattern, "access/custom-error", "Routing", ["status", "routing", "error", "composition"], typeof(StatusRouteContent)),

        // Overlays
        D("AppDialog", "Overlays", Interactive, "#app-dialog", "Common", ["dialog", "modal", "overlay"]),
        D("AppDrawer", "Overlays", Interactive, "#app-dialog", "Common", ["drawer", "panel", "overlay"]),

        // Navigation
        D("AppLogo", "Navigation", Interactive, "#app-logo", "Navigation", ["logo", "branding", "layout"], typeof(AppLogo)),
        D("AppTabs", "Navigation", Interactive, "#app-tabs", "Navigation", ["tabs", "navigation", "keyboard"]),
        D("AppTab", "Navigation", Interactive, "#app-tabs", "Navigation", ["tab", "navigation"]),
        D("Nav", "Navigation", Interactive, "application-shell", "Navigation", ["navigation", "shell"]),
        D("NavGroup", "Navigation", Interactive, "application-shell", "Navigation", ["navigation", "group"]),
        D("NavItem", "Navigation", Interactive, "application-shell", "Navigation", ["navigation", "item"]),
        D("NavSubmenu", "Navigation", Interactive, "application-shell", "Navigation", ["navigation", "submenu"]),
        D("SectionNavigation", "Navigation", Interactive, "application-shell/person", "Navigation", ["navigation", "section"]),
        D("MobileNavigationAccount", "Navigation", Interactive, "application-shell", "Navigation", ["navigation", "mobile", "account"]),
        D("ProfileMenu", "Navigation", Interactive, "application-shell", "Navigation", ["navigation", "profile", "menu"]),
        D("HeaderControl", "Navigation", Reference, "components/preferences-selector", "Region", ["navigation", "header", "preferences"], typeof(HeaderControl)),
        D("HeaderControlWithUser", "Navigation", Pattern, "layout-patterns/header-footer", "Region", ["navigation", "header", "identity"], typeof(HeaderControlWithUser)),
        D("ShellProfileControl", "Navigation", Pattern, "application-shell", "Region", ["navigation", "profile", "identity"], typeof(ShellProfileControl)),

        // Preferences & time
        D("CultureSelector", "Preferences & time", Interactive, "#library-directory", "Common", ["culture", "locale", "preferences"]),
        D("PreferencesSelector", "Preferences & time", Interactive, "#library-directory", "Common", ["preferences", "settings"]),
        D("ThemeSwitcher", "Preferences & time", Interactive, "/", "Common", ["theme", "light", "dark"]),
        D("InitializeTimeZone", "Preferences & time", Interactive, "form-controls#timezone-title", "Timezone", ["timezone", "initialization"]),
        D("LocalTime", "Preferences & time", Interactive, "#library-directory", "Timezone", ["timezone", "time", "display"]),

        // Experience
        D("ExperienceCard", "Experience", Interactive, "#library-directory", "Experience", ["experience", "card", "content"]),
        D("ExperienceDisclosure", "Experience", Interactive, "#library-directory", "Experience", ["experience", "disclosure", "content"]),
        D("ExperienceDisclosureGroup", "Experience", Interactive, "#library-directory", "Experience", ["experience", "disclosure", "group"]),
        D("ExperienceHeading", "Experience", Interactive, "#library-directory", "Experience", ["experience", "heading", "content"]),

        // Marketing
        D("MarketingActionLink", "Marketing", Interactive, "landing", "Marketing", ["marketing", "link", "action"]),
        D("MarketingCallToAction", "Marketing", Interactive, "landing", "Marketing", ["marketing", "cta", "action"]),
        D("MarketingCard", "Marketing", Interactive, "landing", "Marketing", ["marketing", "card", "content"]),
        D("MarketingContainer", "Marketing", Interactive, "landing", "Marketing", ["marketing", "container", "layout"]),
        D("MarketingFeatureGrid", "Marketing", Interactive, "landing", "Marketing", ["marketing", "feature", "grid"]),
        D("MarketingHero", "Marketing", Interactive, "landing", "Marketing", ["marketing", "hero", "heading"]),
        D("MarketingPage", "Marketing", Pattern, "landing", "Marketing", ["marketing", "page", "layout"], typeof(MarketingPage)),
        D("MarketingProductFrame", "Marketing", Interactive, "landing", "Marketing", ["marketing", "product", "frame"]),
        D("MarketingProofItem", "Marketing", Interactive, "landing", "Marketing", ["marketing", "proof", "content"]),
        D("MarketingProofStrip", "Marketing", Interactive, "landing", "Marketing", ["marketing", "proof", "strip"]),
        D("MarketingSectionHeader", "Marketing", Interactive, "landing", "Marketing", ["marketing", "heading", "section"]),
        D("MarketingStep", "Marketing", Interactive, "landing", "Marketing", ["marketing", "step", "content"]),
        D("MarketingStepList", "Marketing", Interactive, "landing", "Marketing", ["marketing", "steps", "content"]),

        // Application layouts
        D("AccessPageLayout", "Application layouts", Pattern, "access/login", "Layouts", ["layout", "access", "identity"], typeof(AccessPageLayout)),
        D("ApplicationShell", "Application layouts", Pattern, "application-shell", "Layouts", ["layout", "application", "shell"], typeof(ApplicationShell)),
        D("ApplicationPageHeading", "Application layouts", Pattern, "application-shell", "Layouts", ["layout", "heading", "breadcrumb"], typeof(ApplicationPageHeading)),
        D("HeaderFooterLayout", "Application layouts", Pattern, "layout-patterns/header-footer", "Layouts", ["layout", "header", "footer"], typeof(HeaderFooterLayout)),
        D("IdentityLayout", "Application layouts", Pattern, "layout-patterns/identity", "Layouts", ["layout", "identity", "access"], typeof(IdentityLayout)),
        D("LandingLayout", "Application layouts", Pattern, "layout-patterns/landing", "Layouts", ["layout", "landing", "marketing"], typeof(LandingLayout)),
        D("MainLayout", "Application layouts", Pattern, "layout-patterns/application", "Layouts", ["layout", "application", "main"], typeof(MainLayout)),
        D("RootLayout", "Application layouts", Pattern, "layout-patterns/application", "Layouts", ["layout", "root", "application"], typeof(RootLayout)),

        // Infrastructure
        D("AppInputSupport", "Infrastructure", Reference, "#library-directory", "Common", ["infrastructure", "input", "form"], runtimeType: typeof(AppInputSupport), status: PlaybookComponentStatus.Beta),
        D("AppOverlayHost", "Infrastructure", Reference, "#app-dialog", "Common", ["infrastructure", "overlay", "host"], runtimeType: typeof(AppOverlayHost), status: PlaybookComponentStatus.Beta),
        D("LayoutMobileMenuButtonWrapper", "Infrastructure", Reference, "#library-directory", "Layouts", ["infrastructure", "mobile", "layout"], runtimeType: typeof(LayoutMobileMenuButtonWrapper), status: PlaybookComponentStatus.Beta),
        D("ParameterizedStatusRouteAdapter", "Infrastructure", Reference, "access/custom-error", "Routing", ["infrastructure", "routing", "status"], runtimeType: typeof(ParameterizedStatusRouteAdapter), status: PlaybookComponentStatus.Beta)
    ];

    public static IEnumerable<IGrouping<string, PlaybookComponentDefinition>> Groups =>
        All.GroupBy(component => component.Category);

    public static PlaybookComponentDefinition? Find(string? slug) =>
        string.IsNullOrWhiteSpace(slug)
            ? null
            : All.FirstOrDefault(component => component.Slug.Equals(slug, StringComparison.OrdinalIgnoreCase));

    public static string ResolveExistingHref(PlaybookComponentDefinition component) =>
        component.ExistingHref.StartsWith('#') ? $"components{component.ExistingHref}" : component.ExistingHref;

    private static PlaybookComponentDefinition D(
        string name,
        string category,
        PlaybookComponentCoverageKind coverage,
        string href,
        string sourceArea,
        IReadOnlyList<string> tags,
        Type? runtimeType = null,
        PlaybookComponentStatus status = PlaybookComponentStatus.Stable) =>
        new(
            name,
            ToSlug(name),
            category,
            Summary(name),
            status,
            coverage,
            href,
            sourceArea,
            tags,
            runtimeType);

    private static string Summary(string name) => Summaries.TryGetValue(name, out var summary)
        ? summary
        : throw new InvalidOperationException($"A component-specific summary is required for {name}.");

    private static string ToSlug(string value)
    {
        var builder = new System.Text.StringBuilder(value.Length + 8);
        for (var index = 0; index < value.Length; index++)
        {
            var character = value[index];
            if (index > 0 && char.IsUpper(character) && (char.IsLower(value[index - 1]) || index + 1 < value.Length && char.IsLower(value[index + 1])))
            {
                builder.Append('-');
            }
            builder.Append(char.ToLowerInvariant(character));
        }
        return builder.ToString();
    }
}
