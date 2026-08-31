using System.Text;

namespace Suttisak.Blazor.Playbook.ComponentDocs;

public enum PlaybookPatternMaturity
{
    Stable,
    Beta
}

public sealed record PlaybookPatternIngredient(
    string ComponentId,
    string ComponentName,
    string Role)
{
    public string ComponentHref => $"components/{ComponentId}";
}

public sealed record PlaybookPatternStep(
    string Title,
    string Detail);

public sealed record PlaybookPatternOwnership(
    IReadOnlyList<string> LibraryResponsibilities,
    IReadOnlyList<string> ApplicationResponsibilities);

public sealed record PlaybookPatternQualityCheck(
    string Dimension,
    string Requirement);

public sealed record PlaybookPatternEvidence(
    string Kind,
    string Source,
    string Guarantee);

public sealed record PlaybookPatternDefinition(
    string Name,
    string Slug,
    string Category,
    PlaybookPatternMaturity Maturity,
    string Summary,
    string Intent,
    IReadOnlyList<string> Tags,
    IReadOnlyList<PlaybookPatternIngredient> Ingredients,
    IReadOnlyList<PlaybookPatternStep> CompositionSteps,
    PlaybookPatternOwnership Ownership,
    string MinimalRazorRecipe,
    IReadOnlyList<PlaybookPatternQualityCheck> QualityChecks,
    string LiveHref,
    string LiveLabel,
    IReadOnlyList<PlaybookPatternEvidence> Evidence)
{
    public string DetailHref => $"patterns/{Slug}";
}

public static class PlaybookPatternCatalog
{
    public static IReadOnlyList<PlaybookPatternDefinition> All { get; } =
    [
        new(
            "Validated form workflow",
            "validated-form-workflow",
            "Data entry",
            PlaybookPatternMaturity.Stable,
            "Compose a readable EditForm from field primitives, responsive geometry, validation feedback, and an explicit action boundary.",
            "Use this pattern when a page collects related values that must remain understandable before, during, and after validation.",
            ["form", "validation", "responsive", "edit-context"],
            [
                I("FormSection", "Names the task and groups its supporting guidance."),
                I("FormGrid", "Defines responsive field geometry without owning business fields."),
                I("FormField", "Lets an individual control opt into column span and placement."),
                I("AppTextBox", "Provides the labelled text-input contract."),
                I("AppSelect", "Provides a typed choice contract."),
                I("FormValidationSummary", "Collects model-level errors when a summary is useful."),
                I("FormActions", "Separates commit and cancel actions from the data fields."),
                I("AppButton", "Expresses submit priority and secondary actions.")
            ],
            [
                S("Start with the model boundary", "Create one EditContext or model for the task and keep validation rules beside that model."),
                S("Group before arranging", "Use FormSection to explain the task, then FormGrid and FormField to describe geometry."),
                S("Bind semantic controls", "Choose inputs by value type and always provide a visible label and useful description."),
                S("Close with an action boundary", "Place validation feedback before FormActions so the submit path is predictable in reading and focus order.")
            ],
            O(
                ["Label, description, validation, and focus presentation", "Responsive grid collapse and field spacing", "Button hierarchy and disabled presentation"],
                ["Form model, annotations, and cross-field rules", "Submission side effects, authorization, and error recovery", "Product copy, defaults, and cancellation behavior"]),
            """
            <EditForm Model="@Profile" OnValidSubmit="SaveAsync">
                <DataAnnotationsValidator />
                <FormSection Title="Profile">
                    <FormValidationSummary />
                    <FormGrid Columns="2">
                        <FormField><AppTextBox Label="Name" @bind-Value="Profile.Name" /></FormField>
                        <FormField><AppSelect Label="Team" Options="@Teams" @bind-Value="Profile.Team" /></FormField>
                    </FormGrid>
                    <FormActions><AppButton Type="submit" Variant="AppButtonVariant.Primary">Save</AppButton></FormActions>
                </FormSection>
            </EditForm>
            """,
            [
                Q("Accessibility", "Every field keeps a visible label, error association, and a logical keyboard order."),
                Q("Responsive", "At the narrow breakpoint, the field grid becomes one readable column without changing source order."),
                Q("State", "Loading, server failure, and successful submission remain distinguishable without relying on color alone.")
            ],
            "form-controls",
            "Open the form controls laboratory",
            [
                E("Browser", "form-composition-workbench.spec.mjs", "Exercises section, grid, field, validation, and action composition."),
                E("Browser", "playbook.spec.mjs", "Verifies the routed interactive and static form contracts.")
            ]),

        new(
            "Virtualized data workspace",
            "virtualized-data-workspace",
            "Data operations",
            PlaybookPatternMaturity.Stable,
            "Place search, filters, actions, a virtualized grid, and operational feedback inside one labelled data surface.",
            "Use this pattern for large, scan-heavy datasets where stable row identity and bounded DOM work matter more than page-at-a-time navigation.",
            ["data", "grid", "virtualization", "performance"],
            [
                I("AppGridShell", "Names the workspace and arranges search, filters, actions, data, and footer slots."),
                I("AppGrid", "Owns table semantics, sorting hooks, and the virtualized row window."),
                I("AppGridPropertyColumn", "Projects sortable scalar values."),
                I("AppGridTemplateColumn", "Renders richer cells and row actions."),
                I("AppTextBox", "Collects the search query."),
                I("AppSelect", "Applies a typed status or facet filter."),
                I("AppButton", "Hosts export, create, and row-level actions.")
            ],
            [
                S("Name the dataset", "Give AppGridShell a task-oriented accessible label, not a generic label such as Data table."),
                S("Shape the query first", "Apply search, filters, and authorization before exposing IQueryable items to the grid."),
                S("Declare virtual geometry", "Use a fixed ItemSize, a restrained OverscanCount, and an ItemKey that survives sorting and refresh."),
                S("Keep actions explicit", "Give icon-only row actions record-specific names and keep bulk actions outside the table body.")
            ],
            O(
                ["Table semantics, sort interaction, and virtual row rendering", "Workspace slot layout and visual hierarchy", "Keyboard-visible control and row-action states"],
                ["Query execution, filtering, paging, and authorization", "Column meaning, formatting, and record navigation", "Export jobs, mutations, telemetry, and empty-state copy"]),
            """
            <AppGridShell AriaLabel="Assessment register">
                <Search><AppTextBox Label="Search records" @bind-Value="Search" /></Search>
                <ChildContent>
                    <AppGrid TGridItem="Assessment" Items="@Rows" Virtualize="true"
                             ItemSize="40" OverscanCount="3" ItemKey="row => row.Id">
                        <AppGridPropertyColumn Property="row => row.Owner" Title="Owner" Sortable="true" />
                        <AppGridTemplateColumn Title="Status">@context.Status</AppGridTemplateColumn>
                    </AppGrid>
                </ChildContent>
            </AppGridShell>
            """,
            [
                Q("Accessibility", "The shell and grid have distinct task labels; every row action names its target record."),
                Q("Responsive", "Narrow screens preserve access to columns through intentional overflow or a documented alternate view."),
                Q("Performance", "Rendered rows remain bounded while scrolling the full source and row height stays equal to ItemSize.")
            ],
            "grid-performance",
            "Run the 100,000-row performance laboratory",
            [
                E("Browser", "playbook.spec.mjs", "Asserts the 100,000-record source keeps a bounded row window."),
                E("Browser", "pagination-data-workbench.spec.mjs", "Covers labelled paged and virtual grid shells."),
                E("Browser", "data-grid-workbench.spec.mjs", "Covers search, sorting, loading, and empty data states.")
            ]),

        new(
            "Product marketing landing",
            "product-marketing-landing",
            "Marketing",
            PlaybookPatternMaturity.Stable,
            "Build a product narrative from a promise, proof, product frame, benefits, steps, and a final call to action.",
            "Use this pattern for a public product entry point that needs application-owned identity and content on top of shared responsive sections.",
            ["marketing", "landing", "story", "conversion"],
            [
                I("MarketingPage", "Provides the main landmark and skip-target contract."),
                I("MarketingContainer", "Keeps narrative sections on one shared reading measure."),
                I("MarketingHero", "Pairs the primary promise with actions and product media."),
                I("MarketingProofStrip", "Groups concise evidence immediately after the promise."),
                I("MarketingProofItem", "Expresses one proof point with value and explanation."),
                I("MarketingProductFrame", "Frames a credible product preview without owning its content."),
                I("MarketingFeatureGrid", "Arranges differentiated benefits."),
                I("MarketingCard", "Carries one benefit and its supporting visual."),
                I("MarketingStepList", "Explains the progression from signal to outcome."),
                I("MarketingCallToAction", "Closes the narrative with one next step."),
                I("MarketingActionLink", "Provides primary and secondary marketing actions.")
            ],
            [
                S("Lead with one promise", "Give MarketingHero a reader outcome, supporting explanation, and no more than two competing actions."),
                S("Earn the next scroll", "Place compact proof directly after the hero, then show a concrete product frame before abstract benefits."),
                S("Explain the path", "Use feature and step compositions to answer why this matters and what happens next."),
                S("Close the loop", "Repeat the primary action in MarketingCallToAction after the reader has enough evidence to decide.")
            ],
            O(
                ["Responsive section geometry and shared reading widths", "Action variants, feature grids, proof strips, and step rhythm", "Skip-link and landmark plumbing inside MarketingPage"],
                ["Product promise, claims, proof, and legal review", "Brand assets, image crops, destinations, and analytics", "Product preview contents and conversion behavior"]),
            """
            <MarketingPage Id="product" SkipTarget="benefits">
                <MarketingHero Title="Understand the signal. Act with confidence."
                               Description="A focused path from information to action.">
                    <Actions><MarketingActionLink Href="#benefits">Explore</MarketingActionLink></Actions>
                </MarketingHero>
                <MarketingProofStrip AriaLabel="Product proof">
                    <MarketingProofItem Value="AA" Title="Accessible" Description="Built on a tested foundation." />
                </MarketingProofStrip>
                <MarketingFeatureGrid id="benefits">
                    <MarketingCard Title="One clear benefit">...</MarketingCard>
                </MarketingFeatureGrid>
                <MarketingCallToAction>
                    <Content><h2>Ready to continue?</h2></Content>
                    <Actions><MarketingActionLink Href="/start">Get started</MarketingActionLink></Actions>
                </MarketingCallToAction>
            </MarketingPage>
            """,
            [
                Q("Accessibility", "The page has one main landmark, a working skip target, ordered headings, and meaningful media alternatives."),
                Q("Responsive", "Proof, feature, and CTA layouts stack without reordering the product narrative."),
                Q("Content", "Claims have evidence, actions describe their destination, and decorative media stays silent.")
            ],
            "landing",
            "Open the themed landing-page sandbox",
            [
                E("Browser", "marketing-workbench.spec.mjs", "Exercises the shared marketing compositions and routed MarketingPage landmark."),
                E("Browser", "layout-infrastructure-contracts.spec.mjs", "Verifies MarketingPage is executed by the real landing route.")
            ]),

        new(
            "Secure access flow",
            "secure-access-flow",
            "Access",
            PlaybookPatternMaturity.Stable,
            "Compose sign-in or registration inside a branded, responsive access frame while authentication policy stays application-owned.",
            "Use this pattern for unauthenticated routes that need a consistent identity surface, clear credentials path, and optional provider choices.",
            ["access", "identity", "authentication", "responsive"],
            [
                I("AccessPageLayout", "Arranges brand, preferences, form copy, controls, and the product showcase."),
                I("AppTextBox", "Collects credential values with the correct input type and autocomplete token."),
                I("AppCheckbox", "Hosts explicit session-persistence consent."),
                I("AppButton", "Expresses the primary credential action and secondary recovery actions.")
            ],
            [
                S("Frame the access task", "Provide one route-specific title and short explanation through AccessPageLayout slots."),
                S("Offer enabled methods only", "Show provider, passkey, or password paths only when the application has configured them."),
                S("Use browser semantics", "Set email, username, current-password, and new-password autocomplete values accurately."),
                S("Keep recovery nearby", "Place account creation and credential recovery beside the form without competing with the primary action.")
            ],
            O(
                ["Responsive access geometry and visual slot order", "Shared input, checkbox, and button semantics", "Theme-aware surface, focus, and error presentation"],
                ["Authentication providers, antiforgery, rate limits, and session policy", "Brand copy, consent language, links, and telemetry", "Server validation, redirects, and account-recovery workflows"]),
            """
            <AccessPageLayout HeadingId="sign-in-title" ShowcaseLabel="Product message">
                <Brand>@Brand</Brand>
                <Title>Sign in to continue</Title>
                <ChildContent>
                    <EditForm Model="@Credentials" OnValidSubmit="SignInAsync">
                        <AppTextBox Label="Email" Type="email" Autocomplete="username" @bind-Value="Credentials.Email" />
                        <AppTextBox Label="Password" Type="password" Autocomplete="current-password" @bind-Value="Credentials.Password" />
                        <AppButton Type="submit" Variant="AppButtonVariant.Primary">Sign in</AppButton>
                    </EditForm>
                </ChildContent>
            </AccessPageLayout>
            """,
            [
                Q("Accessibility", "The route focuses one visible heading, labels every credential field, and reports authentication failure without moving focus unexpectedly."),
                Q("Responsive", "The form precedes optional showcase content in reading order and remains usable at 320 CSS pixels."),
                Q("Security", "The Playbook demonstrates layout only; production auth, CSRF protection, and redirect validation stay server-owned.")
            ],
            "access/login",
            "Open the login composition",
            [
                E("Browser", "playbook.spec.mjs", "Covers the real access route, credential controls, language, and theme variants."),
                E("Browser", "layout-infrastructure-contracts.spec.mjs", "Verifies AccessPageLayout executes on a routed page.")
            ]),

        new(
            "Application workspace shell",
            "application-workspace-shell",
            "Application structure",
            PlaybookPatternMaturity.Stable,
            "Compose persistent product identity, grouped navigation, user controls, breadcrumbs, and page actions around one routed main region.",
            "Use this pattern as the authenticated frame for task-oriented applications with multiple sections and responsive navigation.",
            ["application", "shell", "navigation", "layout"],
            [
                I("ApplicationShell", "Owns the responsive chrome and single routed main landmark."),
                I("ApplicationPageHeading", "Connects breadcrumb state and the route heading to the shell."),
                I("PageBreadcrumbs", "Publishes hierarchical route context."),
                I("PageHeading", "Names the current task and hosts page-level actions."),
                I("PageActionToolbar", "Groups contextual route actions."),
                I("Nav", "Provides the navigation landmark and embedded shell treatment."),
                I("NavGroup", "Labels related destination groups."),
                I("NavItem", "Represents a routed destination and active state."),
                I("NavSubmenu", "Reveals nested administration destinations."),
                I("ProfileMenu", "Hosts signed-in identity and account actions when the application uses the shared implementation."),
                I("ShellProfileControl", "Selects the signed-in profile menu or access entry point for the shell.")
            ],
            [
                S("Establish one main owner", "Let ApplicationShell own the routed main landmark; pages contribute content rather than another main."),
                S("Group destinations by task", "Compose NavGroup and NavItem labels from the user mental model, not the code namespace."),
                S("Publish route context", "Provide breadcrumbs and one PageHeading for every routed workspace."),
                S("Adapt the chrome", "At narrow widths, move navigation into the shell overlay while preserving destination and focus state.")
            ],
            O(
                ["Shell landmarks, responsive navigation, and overlay mechanics", "Navigation-group, item, heading, and breadcrumb presentation", "Slots for brand, preferences, profile, messages, and route content"],
                ["Route table, authorization, product identity, and destination labels", "Profile commands, notification data, and navigation badges", "Page content, contextual actions, breadcrumbs, and mutation behavior"]),
            """
            <ApplicationShell MainContentId="workspace-main">
                <Brand>@Brand</Brand>
                <Navigation>
                    <Nav Embedded="true">
                        <NavGroup Label="Workspace">
                            <NavItem Href="records" IconRestName="Table">Records</NavItem>
                        </NavGroup>
                    </Nav>
                </Navigation>
                <Heading><ApplicationPageHeading Breadcrumbs="@Breadcrumbs">@Heading</ApplicationPageHeading></Heading>
                <ChildContent>@Body</ChildContent>
            </ApplicationShell>
            """,
            [
                Q("Accessibility", "Exactly one main landmark exists; navigation, menu buttons, profile controls, and route headings have stable names."),
                Q("Responsive", "The mobile menu traps no focus, restores focus to its opener, and does not hide routed content from assistive technology."),
                Q("Routing", "Active navigation and breadcrumb state follow the current URI and clear when the route changes.")
            ],
            "application-shell",
            "Open the authenticated workspace",
            [
                E("Browser", "playbook.spec.mjs", "Exercises desktop collapse, mobile navigation, and application routes."),
                E("Browser", "layout-infrastructure-contracts.spec.mjs", "Verifies the real ApplicationShell contract and its slots."),
                E("Browser", "navigation-workbench.spec.mjs", "Covers grouped and nested shared navigation behavior.")
            ]),

        new(
            "Record management workflow",
            "record-management-workflow",
            "Application workflows",
            PlaybookPatternMaturity.Beta,
            "Connect a searchable record grid to create and edit drawers, destructive confirmation, paging, and record detail navigation.",
            "Use this pattern for bounded CRUD work where list context should remain visible while a user edits or confirms a record action.",
            ["records", "crud", "drawer", "dialog", "grid"],
            [
                I("AppGridShell", "Frames search, record count, grid, and pagination."),
                I("AppGrid", "Presents sortable records and row actions."),
                I("AppGridPaginator", "Moves through bounded result windows."),
                I("AppDrawer", "Keeps list context while creating or editing one record."),
                I("AppDialog", "Confirms a destructive record operation."),
                I("FormGrid", "Arranges fields inside the editor."),
                I("AppTextBox", "Collects search and editable text values."),
                I("AppSelect", "Edits a constrained record state."),
                I("AppButton", "Hosts create, edit, save, cancel, and delete actions.")
            ],
            [
                S("Keep the list authoritative", "Search, sorting, pagination, and visible counts all derive from the same filtered record source."),
                S("Edit a draft", "Open AppDrawer with a copy so cancellation never mutates the visible record."),
                S("Commit intentionally", "Enable Save only when the draft is valid, then replace or append through the application store."),
                S("Confirm irreversible work", "Name the target inside AppDialog and make the safe exit at least as easy to find as Delete.")
            ],
            O(
                ["Grid, drawer, dialog, paginator, field, and button interaction contracts", "Overlay focus containment, dismissal, and dangerous visual intent", "Responsive data-surface and editor geometry"],
                ["Record store, persistence, optimistic concurrency, and authorization", "Draft validation, server errors, audit history, and undo policy", "Column definitions, product terminology, and post-save navigation"]),
            """
            <AppGridShell AriaLabel="Program records">
                <Search><AppTextBox Label="Search records" @bind-Value="Search" /></Search>
                <ChildContent><AppGrid TGridItem="Record" Items="@FilteredRecords">...</AppGrid></ChildContent>
                <Pagination><AppGridPaginator State="@Pagination" /></Pagination>
            </AppGridShell>

            @code {
                private Task<AppOverlayResult<Record>> EditAsync() =>
                    OverlayService.ShowDrawerAsync<RecordEditor, Record>(
                        new AppOverlayOptions { Title = "Record editor", DrawerPosition = AppDrawerPosition.End });

                private Task<AppOverlayResult<bool>> DeleteAsync() =>
                    OverlayService.ShowConfirmationAsync(new AppConfirmationOptions
                    {
                        Title = "Delete this record?",
                        Message = "This action cannot be undone.",
                        Dangerous = true
                    });
            }
            """,
            [
                Q("Accessibility", "Every row action names its record; drawer and dialog headings describe the active operation and target."),
                Q("Responsive", "The editor remains operable without hiding the close action, while the record list preserves a deliberate overflow strategy."),
                Q("Safety", "Cancel leaves source data untouched and destructive confirmation states whether recovery or undo is available.")
            ],
            "application-shell/records",
            "Run the record-management workflow",
            [
                E("Browser", "data-grid-workbench.spec.mjs", "Covers shared search, sorting, loading, and empty grid states."),
                E("Browser", "design-system-playbook.spec.mjs", "Covers drawer and dialog focus, dismissal, and dangerous variants."),
                E("Executable route", "application-shell/records", "Provides create, edit, delete, search, sort, paginate, and detail navigation in one composition.")
            ]),

        new(
            "Status route recovery",
            "status-route-recovery",
            "Routing & recovery",
            PlaybookPatternMaturity.Stable,
            "Map HTTP outcomes to a branded StatusPage with route-safe actions, support context, and application-owned recovery copy.",
            "Use this pattern for forbidden, missing, and server-error routes that must explain what happened and offer a credible next action.",
            ["status", "routing", "error", "recovery"],
            [
                I("StatusRouteContent", "Resolves route options, status semantics, actions, and optional request reference."),
                I("StatusPage", "Renders the shared visual hierarchy and live-region behavior."),
                I("ParameterizedStatusRouteAdapter", "Adapts a status-code route parameter into the shared content contract."),
                I("AppButton", "Expresses retry, return, and support actions.")
            ],
            [
                S("Resolve the outcome", "Map the route status code to a known forbidden, not-found, or server-error configuration."),
                S("Explain without blame", "State what is known, preserve security boundaries, and avoid exposing exception details."),
                S("Offer recovery", "Provide one primary action that can succeed now and a stable path back to a known application route."),
                S("Attach support context", "Show a safe request reference only when it helps support correlate the failure.")
            ],
            O(
                ["Status semantics, page composition, and accessible announcement mode", "Shared visual hierarchy for code, title, description, actions, and reference", "Adapter between route status parameters and presentation"],
                ["Brand, copy, safe home path, retry behavior, and support guidance", "Logging, exception handling, correlation IDs, and observability", "Which incident details are safe to reveal to the current user"]),
            """
            builder.Services.AddSuttisakStatusRoutes(options =>
            {
                options.BrandName = "Product";
                options.HomeHref = "/workspace";
                options.Error.PrimaryActionLabel = "Try again";
            });

            <StatusRouteContent StatusCode="@StatusCode" RequestId="@RequestId" />
            """,
            [
                Q("Accessibility", "Forbidden and not-found states use polite region semantics; unexpected errors use an assertive alert without repeated announcements."),
                Q("Responsive", "Actions wrap in reading order and the status explanation remains readable without horizontal scrolling."),
                Q("Security", "Copy and request references reveal no stack, resource existence, account detail, or authorization rule.")
            ],
            "access/custom-error",
            "Configure and preview a status route",
            [
                E("Browser", "catalog-and-design-tokens.spec.mjs", "Verifies custom status route actions, status semantics, brand, and request reference."),
                E("Browser", "design-system-playbook.spec.mjs", "Covers StatusPage variants and live-region behavior."),
                E("Executable routes", "access/forbidden · access/not-found · access/server-error", "Exercise fixed forbidden, missing, and unexpected-error outcomes.")
            ]),

        new(
            "Router-level layout composition",
            "router-level-layout-composition",
            "Application structure",
            PlaybookPatternMaturity.Beta,
            "Choose the layout that owns the page chrome, then fill named sections without introducing a second shell or main landmark.",
            "Use this pattern when Blazor routing must select application, identity, landing, or header/body chrome while pages retain content ownership.",
            ["router", "layout", "sections", "landmarks"],
            [
                I("RootLayout", "Provides initialization and recoverable root infrastructure."),
                I("MainLayout", "Composes the authenticated application layout at router level."),
                I("HeaderFooterLayout", "Provides a compact header and routed body contract."),
                I("IdentityLayout", "Maps identity sections into the access composition."),
                I("LandingLayout", "Frames marketing routes while the page owns its main story."),
                I("ApplicationShell", "Supplies the main and responsive navigation used by MainLayout."),
                I("HeaderControlWithUser", "Composes preferences with the authenticated or anonymous header action."),
                I("PageBreadcrumbs", "Publishes page hierarchy to the selected layout."),
                I("PageHeading", "Fills the shared route-heading section."),
                I("Nav", "Fills the application navigation section.")
            ],
            [
                S("Choose one chrome owner", "Select the layout with @layout or router configuration and do not wrap the page in a competing shell."),
                S("Fill named sections", "Supply brand, navigation, breadcrumbs, heading, and controls through the section IDs exposed by that layout."),
                S("Keep landmarks singular", "Know whether the layout or body component owns main before adding routed content."),
                S("Clear route state", "Ensure breadcrumb and named-section content does not leak after navigating to a page that omits it.")
            ],
            O(
                ["Layout landmarks, section outlet IDs, responsive chrome, and root infrastructure", "Shared shell, access, landing, and header/body geometry", "The contract used by pages to publish navigation and heading content"],
                ["Layout selection per route, route hierarchy, and authorization", "Section content, brand, destinations, breadcrumbs, and page actions", "Routed body, application state, initialization policy, and error telemetry"]),
            """
            @page "/workspace"
            @layout MainLayout

            <SectionContent SectionId="@MainLayout.NavigationSection">
                <Nav Embedded="true">...</Nav>
            </SectionContent>
            <SectionContent SectionName="@CommonSections.PageHeading">
                <PageHeading Title="Workspace" />
            </SectionContent>

            <PageBreadcrumbs Items="@Breadcrumbs" />
            <section aria-labelledby="workspace-title">...</section>
            """,
            [
                Q("Accessibility", "The rendered route has one main landmark, one visible page heading, and uniquely named navigation landmarks."),
                Q("Responsive", "Layout chrome adapts at its own media queries while routed body content remains independently responsive."),
                Q("Lifecycle", "Named-section and breadcrumb content clears after navigation and root initialization does not duplicate across layouts.")
            ],
            "layout-patterns/application",
            "Open the real MainLayout route",
            [
                E("Browser", "layout-infrastructure-contracts.spec.mjs", "Runs MainLayout, RootLayout, HeaderFooterLayout, IdentityLayout, and LandingLayout as real router layouts."),
                E("Executable routes", "layout-patterns/application · layout-patterns/identity · layout-patterns/landing · layout-patterns/header-footer", "Expose each layout boundary without a nested Playbook shell.")
            ])
    ];

    public static IReadOnlyList<string> Categories { get; } =
        All.Select(pattern => pattern.Category).Distinct(StringComparer.Ordinal).ToArray();

    public static PlaybookPatternDefinition? Find(string? slug) =>
        string.IsNullOrWhiteSpace(slug)
            ? null
            : All.FirstOrDefault(pattern => pattern.Slug.Equals(slug, StringComparison.OrdinalIgnoreCase));

    public static IReadOnlyList<PlaybookPatternDefinition> PatternsForComponent(string componentName) =>
        string.IsNullOrWhiteSpace(componentName)
            ? []
            : All.Where(pattern => pattern.Ingredients.Any(ingredient =>
                    ingredient.ComponentName.Equals(componentName, StringComparison.OrdinalIgnoreCase)))
                .ToArray();

    private static PlaybookPatternIngredient I(string componentName, string role) =>
        new(ToSlug(componentName), componentName, role);

    private static PlaybookPatternStep S(string title, string detail) => new(title, detail);

    private static PlaybookPatternOwnership O(
        IReadOnlyList<string> libraryResponsibilities,
        IReadOnlyList<string> applicationResponsibilities) =>
        new(libraryResponsibilities, applicationResponsibilities);

    private static PlaybookPatternQualityCheck Q(string dimension, string requirement) =>
        new(dimension, requirement);

    private static PlaybookPatternEvidence E(string kind, string source, string guarantee) =>
        new(kind, source, guarantee);

    private static string ToSlug(string value)
    {
        var builder = new StringBuilder(value.Length + 8);
        for (var index = 0; index < value.Length; index++)
        {
            var character = value[index];
            if (index > 0
                && char.IsUpper(character)
                && (char.IsLower(value[index - 1])
                    || index + 1 < value.Length && char.IsLower(value[index + 1])))
            {
                builder.Append('-');
            }

            builder.Append(char.ToLowerInvariant(character));
        }

        return builder.ToString();
    }
}
