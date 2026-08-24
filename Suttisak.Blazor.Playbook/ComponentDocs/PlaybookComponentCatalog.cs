using Microsoft.AspNetCore.Components;
using Suttisak.Blazor.UserInterface.Components.Marketing;
using Suttisak.Blazor.UserInterface.Components.Navigation;
using Suttisak.Blazor.UserInterface.Components.Common;
using Suttisak.Blazor.UserInterface.Layouts.Shared;

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
    string ExistingHref,
    string SourceArea,
    IReadOnlyList<string> Tags,
    Type? RuntimeType = null)
{
    public string DetailHref => $"components/{Slug}";
    public bool HasLiveSpecimen => ExistingHref.StartsWith('#');
    public bool HasPatternPage => !ExistingHref.StartsWith('#');
}

public static class PlaybookComponentCatalog
{
    public static IReadOnlyList<PlaybookComponentDefinition> All { get; } =
    [
        // Forms & inputs
        D("AppTextBox", "Forms & inputs", "#app-text-box", "Common", ["text", "input", "form"]),
        D("AppTextArea", "Forms & inputs", "#app-text-area", "Common", ["text", "multiline", "form"]),
        D("AppNumberInput", "Forms & inputs", "#app-number-input", "Common", ["number", "input", "form"]),
        D("AppSelect", "Forms & inputs", "#app-select", "Common", ["select", "choice", "form"]),
        D("AppSelectItem", "Forms & inputs", "#app-select", "Common", ["select", "option", "form"]),
        D("AppMultiSelect", "Forms & inputs", "#app-multi-select", "Common", ["select", "multiple", "form"]),
        D("AppRadioGroup", "Forms & inputs", "#app-radio-group", "Common", ["radio", "choice", "form"]),
        D("AppRadio", "Forms & inputs", "#app-radio-group", "Common", ["radio", "choice", "form"]),
        D("AppCheckbox", "Forms & inputs", "#app-checkbox", "Common", ["checkbox", "boolean", "form"]),
        D("AppSwitch", "Forms & inputs", "#app-switch", "Common", ["switch", "boolean", "form"]),
        D("AppCalendarPicker", "Forms & inputs", "#app-calendar-picker", "Common", ["date", "picker", "form"]),
        D("AppTimePicker", "Forms & inputs", "#app-time-picker", "Common", ["time", "picker", "form"]),
        D("AppDateTimePicker", "Forms & inputs", "#app-date-time-picker", "Common", ["date", "time", "picker"]),
        D("FormSection", "Forms & inputs", "#form-composition", "Common", ["form", "composition", "layout"]),
        D("FormGrid", "Forms & inputs", "#form-composition", "Common", ["form", "grid", "layout"]),
        D("FormField", "Forms & inputs", "#form-composition", "Common", ["form", "field", "layout"]),
        D("FormActions", "Forms & inputs", "#form-composition", "Common", ["form", "actions", "layout"]),
        D("FormValidationSummary", "Forms & inputs", "form-controls#edit-form-title", "Common", ["form", "validation", "feedback"]),

        // Actions & surfaces
        D("AppButton", "Actions & surfaces", "#app-button", "Common", ["button", "action", "form"], typeof(AppButton)),
        D("AppCard", "Actions & surfaces", "#library-directory", "Common", ["card", "surface", "container"]),
        D("AppDivider", "Actions & surfaces", "#library-directory", "Common", ["divider", "separator"]),
        D("AppStack", "Actions & surfaces", "#library-directory", "Common", ["stack", "layout", "spacing"]),
        D("CardMenu", "Actions & surfaces", "#library-directory", "Common", ["card", "menu", "action"]),
        D("CompanyFooter", "Actions & surfaces", "#library-directory", "Common", ["footer", "company", "layout"]),
        D("Hero", "Actions & surfaces", "#library-directory", "Common", ["hero", "heading", "surface"]),
        D("Pill", "Actions & surfaces", "#library-directory", "Common", ["pill", "badge", "status"]),
        D("Toolbar", "Actions & surfaces", "#library-directory", "Common", ["toolbar", "actions", "layout"]),
        D("PageActionToolbar", "Actions & surfaces", "application-shell", "Common", ["toolbar", "page", "actions"]),
        D("PageHeading", "Actions & surfaces", "application-shell", "Common", ["heading", "page", "layout"]),

        // Data & display
        D("AppBreadcrumb", "Data & display", "#library-directory", "Common", ["breadcrumb", "navigation"]),
        D("AppDataGrid", "Data & display", "grid-performance", "Common", ["data", "grid", "table"]),
        D("AppGrid", "Data & display", "grid-performance", "Common", ["data", "grid", "table"]),
        D("AppGridPaginator", "Data & display", "grid-performance", "Common", ["grid", "pagination"]),
        D("AppGridPropertyColumn", "Data & display", "grid-performance", "Common", ["grid", "column", "property"]),
        D("AppGridSelectColumn", "Data & display", "grid-performance", "Common", ["grid", "column", "selection"]),
        D("AppGridTemplateColumn", "Data & display", "grid-performance", "Common", ["grid", "column", "template"]),
        D("AppPagination", "Data & display", "#library-directory", "Common", ["pagination", "navigation", "data"]),
        D("AppQuickGrid", "Data & display", "grid-performance", "Common", ["grid", "virtualization", "data"]),
        D("AppQuickPaginator", "Data & display", "grid-performance", "Common", ["grid", "pagination", "data"]),
        D("DataGridContainer", "Data & display", "grid-performance", "Common", ["grid", "container", "data"]),
        D("PageBreadcrumbs", "Data & display", "application-shell", "Common", ["breadcrumb", "page", "navigation"]),

        // Feedback & async
        D("AppLoading", "Feedback & async", "#app-feedback", "Common", ["loading", "async", "feedback"]),
        D("AppProgress", "Feedback & async", "#app-feedback", "Common", ["progress", "async", "feedback"]),
        D("AppSkeleton", "Feedback & async", "#library-directory", "Common", ["skeleton", "loading", "feedback"]),
        D("AsyncContent", "Feedback & async", "#library-directory", "Common", ["async", "loading", "content"]),
        D("FeedbackBanner", "Feedback & async", "#app-feedback", "Common", ["banner", "feedback", "status"]),
        D("StatusPanel", "Feedback & async", "#library-directory", "Common", ["status", "feedback", "panel"]),

        // Overlays
        D("AppDialog", "Overlays", "#app-dialog", "Common", ["dialog", "modal", "overlay"]),
        D("AppDrawer", "Overlays", "#app-dialog", "Common", ["drawer", "panel", "overlay", "action-only"]),

        // Navigation
        D("AppTabs", "Navigation", "#app-tabs", "Navigation", ["tabs", "navigation", "keyboard"]),
        D("AppTab", "Navigation", "#app-tabs", "Navigation", ["tab", "navigation"]),
        D("Nav", "Navigation", "application-shell", "Navigation", ["navigation", "shell"]),
        D("NavGroup", "Navigation", "application-shell", "Navigation", ["navigation", "group"]),
        D("NavItem", "Navigation", "application-shell", "Navigation", ["navigation", "item"]),
        D("NavSubmenu", "Navigation", "application-shell", "Navigation", ["navigation", "submenu"]),
        D("SectionNavigation", "Navigation", "application-shell/person", "Navigation", ["navigation", "section"]),
        D("MobileNavigationAccount", "Navigation", "application-shell", "Navigation", ["navigation", "mobile", "account"]),
        D("ProfileMenu", "Navigation", "application-shell", "Navigation", ["navigation", "profile", "menu"]),

        // Preferences & time
        D("CultureSelector", "Preferences & time", "#library-directory", "Common", ["culture", "locale", "preferences"]),
        D("PreferencesSelector", "Preferences & time", "#library-directory", "Common", ["preferences", "settings"]),
        D("ThemeSwitcher", "Preferences & time", "/", "Common", ["theme", "light", "dark"]),
        D("InitializeTimeZone", "Preferences & time", "form-controls#timezone-title", "Timezone", ["timezone", "initialization"]),
        D("LocalTime", "Preferences & time", "#library-directory", "Timezone", ["timezone", "time", "display"]),

        // Experience
        D("ExperienceCard", "Experience", "#library-directory", "Experience", ["experience", "card", "content"]),
        D("ExperienceDisclosure", "Experience", "#library-directory", "Experience", ["experience", "disclosure", "content"]),
        D("ExperienceDisclosureGroup", "Experience", "#library-directory", "Experience", ["experience", "disclosure", "group"]),
        D("ExperienceHeading", "Experience", "#library-directory", "Experience", ["experience", "heading", "content"]),

        // Marketing
        D("MarketingActionLink", "Marketing", "landing", "Marketing", ["marketing", "link", "action"]),
        D("MarketingCallToAction", "Marketing", "landing", "Marketing", ["marketing", "cta", "action"]),
        D("MarketingCard", "Marketing", "landing", "Marketing", ["marketing", "card", "content"]),
        D("MarketingContainer", "Marketing", "landing", "Marketing", ["marketing", "container", "layout"]),
        D("MarketingFeatureGrid", "Marketing", "landing", "Marketing", ["marketing", "feature", "grid"]),
        D("MarketingHero", "Marketing", "landing", "Marketing", ["marketing", "hero", "heading"]),
        D("MarketingPage", "Marketing", "landing", "Marketing", ["marketing", "page", "layout"], typeof(MarketingPage)),
        D("MarketingProductFrame", "Marketing", "landing", "Marketing", ["marketing", "product", "frame"]),
        D("MarketingProofItem", "Marketing", "landing", "Marketing", ["marketing", "proof", "content"]),
        D("MarketingProofStrip", "Marketing", "landing", "Marketing", ["marketing", "proof", "strip"]),
        D("MarketingSectionHeader", "Marketing", "landing", "Marketing", ["marketing", "heading", "section"]),
        D("MarketingStep", "Marketing", "landing", "Marketing", ["marketing", "step", "content"]),
        D("MarketingStepList", "Marketing", "landing", "Marketing", ["marketing", "steps", "content"]),

        // Application layouts
        D("AccessPageLayout", "Application layouts", "access/login", "Layouts", ["layout", "access", "identity"], typeof(AccessPageLayout)),
        D("ApplicationShell", "Application layouts", "application-shell", "Layouts", ["layout", "application", "shell"], typeof(ApplicationShell)),
        D("HeaderFooterLayout", "Application layouts", "layout-patterns/header-footer", "Layouts", ["layout", "header", "footer"], typeof(HeaderFooterLayout)),
        D("IdentityLayout", "Application layouts", "layout-patterns/identity", "Layouts", ["layout", "identity", "access"], typeof(IdentityLayout)),
        D("LandingLayout", "Application layouts", "layout-patterns/landing", "Layouts", ["layout", "landing", "marketing"], typeof(LandingLayout)),
        D("MainLayout", "Application layouts", "layout-patterns/application", "Layouts", ["layout", "application", "main"], typeof(MainLayout)),
        D("RootLayout", "Application layouts", "layout-patterns/application", "Layouts", ["layout", "root", "application"], typeof(RootLayout)),

        // Infrastructure
        D("AppInputSupport", "Infrastructure", "#library-directory", "Common", ["infrastructure", "input", "form"], runtimeType: typeof(AppInputSupport), status: PlaybookComponentStatus.Beta),
        D("AppOverlayHost", "Infrastructure", "#app-dialog", "Common", ["infrastructure", "overlay", "host"], runtimeType: typeof(AppOverlayHost), status: PlaybookComponentStatus.Beta),
        D("LayoutMobileMenuButtonWrapper", "Infrastructure", "#library-directory", "Layouts", ["infrastructure", "mobile", "layout"], runtimeType: typeof(LayoutMobileMenuButtonWrapper), status: PlaybookComponentStatus.Beta)
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
        string href,
        string sourceArea,
        IReadOnlyList<string> tags,
        Type? runtimeType = null,
        PlaybookComponentStatus status = PlaybookComponentStatus.Stable) =>
        new(name, ToSlug(name), category, Summary(category), status, href, sourceArea, tags, runtimeType);

    private static string Summary(string category) => category switch
    {
        "Forms & inputs" => "Form primitive with the shared validation, focus, and theme contract.",
        "Actions & surfaces" => "Reusable action or surface primitive for application composition.",
        "Data & display" => "Data presentation primitive designed for consistent application display.",
        "Feedback & async" => "Feedback primitive for loading, progress, status, and asynchronous states.",
        "Overlays" => "Overlay primitive that preserves page context and keyboard behavior.",
        "Navigation" => "Navigation primitive with semantic and keyboard-aware behavior.",
        "Preferences & time" => "Preference or time primitive shared across consuming applications.",
        "Experience" => "Reader-facing experience primitive for structured result and guidance content.",
        "Marketing" => "Composable marketing primitive that keeps product copy and assets application-owned.",
        "Application layouts" => "Page-level layout contract for composing complete application experiences.",
        _ => "Infrastructure primitive that supports the shared UI component contracts."
    };

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
