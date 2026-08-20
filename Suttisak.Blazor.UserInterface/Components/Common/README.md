# Application UI primitives

## Cards and data grids

Use `AppCard` for standard application surfaces. It provides optional header,
description, actions, body, and footer regions. `AppGrid<TGridItem>` is the
library-native grid for application pages. `AppQuickGrid<TGridItem>`
remains available when its QuickGrid virtualization model is needed. `AppDataGrid`
is the responsive command-bar and state container, so existing grids can be
migrated one screen at a time.

```razor
<AppDataGrid AriaLabel="People">
    <AppQuickGrid TGridItem="Person" Items="@People.AsQueryable()" Pagination="@pagination">
        <Microsoft.AspNetCore.Components.QuickGrid.PropertyColumn TGridItem="Person" TProp="string"
            Property="@(person => person.Name)" Sortable="true" />
    </AppQuickGrid>
    <Pagination><AppQuickPaginator State="@pagination" /></Pagination>
</AppDataGrid>
```

Supply exactly one of `Items` or `ItemsProvider`. When `Virtualize` is enabled,
all rows must have the fixed height supplied by `ItemSize`. Use `ItemKey` for a
stable primary key so Blazor retains row identity across sorting and refreshes.
For sources with tens of thousands of rows, prefer `Virtualize="true"` with an
`ItemsProvider` (or a provider-backed `IQueryable`) and keep `OverscanCount`
small, usually between 2 and 8. The provider receives only the visible range,
so it should apply `StartIndex`/`Count` at the data source rather than loading
the complete result set. `AppGrid<TGridItem>` applies the same query-side
`Count`/`Skip`/`Take` optimization for paginated property columns; template
column sorting remains a client-side fallback because its `SortBy` is a
delegate.

## Dependency-free data grid

`AppGrid<TGridItem>` is the library-native option for dependency-free grids.
It has no third-party grid or QuickGrid runtime dependency: use
`AppGridPropertyColumn` for a property and `AppGridTemplateColumn` for cell
markup. It accepts an `IQueryable<TGridItem>` through `Items`, or an
`AppGridItemsProvider<TGridItem>` for server-side paging. Provider requests
include zero-based `StartIndex`, requested `Count`, the selected column and
direction in `Sort`, and a cancellation token. Call `RefreshDataAsync()` (or
`RefreshAsync()`) after changing external filters.

```razor
<AppGrid TGridItem="Person" Items="@people.AsQueryable()"
         Pagination="@pagination" ItemKey="@(person => person.Id)"
         SelectionMode="AppGridSelectionMode.Single"
         @bind-SelectedItem="selectedPerson" AriaLabel="People">
    <AppGridSelectColumn TGridItem="Person" />
    <AppGridPropertyColumn TGridItem="Person" TProperty="string"
                           Property="@(person => person.Name)" Title="Name"
                           Sortable="true" IsDefaultSortColumn="true" />
    <AppGridTemplateColumn TGridItem="Person" Title="Actions">
        <AppButton OnClick="@(_ => Edit(context))">Edit</AppButton>
    </AppGridTemplateColumn>
</AppGrid>
<AppGridPaginator State="@pagination" />

@code {
    private readonly AppGridPaginationState pagination = new(itemsPerPage: 25);
    private Person? selectedPerson;
}
```

Use `AppGridSelectColumn` with `Single` or `Multiple` selection and optionally
set `SelectOnRowClick="false"` when only the checkbox should select rows. Rows
remain keyboard-selectable with Enter or Space. Template columns are sortable
only when `SortBy` (for local items) and normally `SortKey` (for a provider) are
supplied. Virtualized rows, column resizing, filtering UI, and vendor-specific
column option menus are intentionally outside this compact replacement.

For controlled selection, bind `SelectedItem` only with
`SelectionMode="AppGridSelectionMode.Single"`, or `SelectedItems` only with
`SelectionMode="AppGridSelectionMode.Multiple"`. Setting the matching bound
value to `null` clears the current selection. The grid raises only the matching
change callback for its selection mode.

## Menu cards and tabs

`CardMenu` renders a native link when it receives `Url`, and a native button
when it receives `OnClick`; the click callback takes precedence when both are
provided for backward compatibility. `Disabled` prevents either action. Its
`Title` and `Subtitle` are rendered as text, so use `ChildContent` for trusted,
application-owned rich markup.

`AppTabs` supports ArrowLeft, ArrowRight, Home, and End from a tab. Provide an
`Id` for each `AppTab` and bind `ActiveId` when a parent needs to own the active
tab; without that binding, the first tab is selected by default.

```razor
<AppTabs AriaLabel="Record sections" @bind-ActiveId="activeSection">
    <AppTab Id="overview" Label="Overview">...</AppTab>
    <AppTab Id="history" Label="History">...</AppTab>
</AppTabs>

@code { private string? activeSection = "overview"; }
```

## Dialogs and drawers

`AppDialog<TInput, TResult>` and `AppDrawer<TInput, TResult>` accept a value in
`ShowAsync` and return `AppOverlayResult<TResult>`. Cancelling with Escape, the
backdrop, the close button, or `CancelAsync` returns `IsCancelled = true`.
Set `Dismissible="false"` when the user must explicitly choose a footer action.
To keep Escape and the close button available but stop backdrop clicks, set
`PreventDismissOnOutsideClick="true"`. `Mode` provides the `Information`,
`Warning`, and `Error` visual treatments. Set `Dangerous="true"` for destructive
confirmation and pair it with the filled `AppButtonVariant.DangerPrimary` action.
Drawers can open from either side and have narrow, standard, and wide sizes and
also support `Mode` and `PreventDismissOnOutsideClick`.

```razor
<AppDialog TInput="Person" TResult="Person" @ref="deleteDialog"
           Title="Delete this person?" Dangerous="true"
           PreventDismissOnOutsideClick="true">
    <Body Context="dialog"><p>@dialog.Value.Name will be removed.</p></Body>
    <Footer Context="dialog">
        <AppButton OnClick="@(_ => dialog.CancelAsync())">Cancel</AppButton>
        <AppButton Variant="AppButtonVariant.DangerPrimary"
                   OnClick="@(_ => dialog.CloseAsync(dialog.Value))">Delete</AppButton>
    </Footer>
</AppDialog>

@code {
    private AppDialog<Person, Person>? deleteDialog;

    private async Task DeleteAsync(Person person)
    {
        var result = await deleteDialog!.ShowAsync(person);
        if (result is { HasValue: true, Value: not null })
            await Repository.DeleteAsync(result.Value.Id);
    }
}
```

The same body/footer context contract applies to `AppDrawer`. Treat reference
type inputs as editable drafts when cancellation must leave the original model
unchanged; `ShowAsync` passes the supplied object reference rather than cloning
it. Opening, paging, sorting, and virtualization require an interactive render
mode; the components can render during static SSR but cannot open or update
until Blazor becomes interactive.

`Suttisak.Blazor.UserInterface` supplies the shared application contract used by
the occupational-health product family.

## Buttons

Use `AppButton` for branded application actions. It owns the shared visual
contract while the consuming application supplies labels, icons, routes, and
event handlers. Use the matching `App*` component for grids, menus, overlays,
and form inputs so behavior and visual tokens remain consistent.

```razor
<AppButton Variant="AppButtonVariant.Primary" OnClick="CreateParticipant">
    <IconStart><Icon Name="Add" Size="20" /></IconStart>
    <ChildContent>Add participant</ChildContent>
</AppButton>

<AppButton Href="participants/export" Variant="AppButtonVariant.Secondary">
    <IconStart><Icon Name="ArrowDownload" Size="20" /></IconStart>
    <ChildContent>Export</ChildContent>
</AppButton>

<AppButton Variant="AppButtonVariant.Subtle"
           Size="AppButtonSize.Compact"
           IconOnly="true"
           AriaLabel="Edit participant">
    <IconStart><Icon Name="Edit" Size="20" /></IconStart>
</AppButton>
```

Always provide `AriaLabel` when `IconOnly` is enabled. `Href` renders a link;
without it the component renders a native button. The component intentionally
does not wrap a third-party button, so application branding stays within the
shared design-token contract.

For four or more page actions, use `PageActionToolbar`: keep one action in
`PrimaryAction`, at most two frequent actions in `SupportingActions`, and place
the remainder in `OverflowActions`. All actions remain visible while they fit;
the native **More** menu appears only when the toolbar's measured width is no
longer sufficient. In narrow containers only the primary action and overflow
trigger remain visible, with supporting actions repeated inside the menu. The
menu works during static SSR without a Blazor click handler. Put destructive
actions last.

## Page composition

```razor
<PageBreadcrumbs Items="@breadcrumbs" />

<PageHeading SectionTitle="Assessment workspace"
             SectionDescription="Administration"
             SectionIcon="@(new Icons.Regular.Size20.Briefcase())"
             Title="Participants"
             Description="Manage people in the current assessment period"
             Icon="@(new Icons.Regular.Size24.People())">
    <SectionActions>
        <AppButton Variant="AppButtonVariant.Subtle">Workspace settings</AppButton>
    </SectionActions>
    <PageActions>
        <AppButton Variant="AppButtonVariant.Primary">Add participant</AppButton>
    </PageActions>
    <Navigation>
        <SectionNavigation AriaLabel="Participant sections" Embedded="true">
            <NavLink href="participants" Match="NavLinkMatch.All">Overview</NavLink>
            <NavLink href="participants/results">Results</NavLink>
        </SectionNavigation>
    </Navigation>
</PageHeading>

<AsyncContent State="@ContentState"
              LoadingTitle="Loading participants"
              EmptyTitle="No participants yet"
              EmptyMessage="Add a participant to begin."
              EmptyIcon="@(new Icons.Regular.Size24.People())"
              ErrorTitle="Participants could not be loaded"
              ErrorMessage="@errorMessage"
              OnRetry="LoadAsync">
    <AppDataGrid>
        <AppQuickGrid TGridItem="Participant" Items="@participants.AsQueryable()" Pagination="pagination">
            <Microsoft.AspNetCore.Components.QuickGrid.PropertyColumn TGridItem="Participant" TProp="string"
                Property="@(participant => participant.Name)" />
        </AppQuickGrid>
        <Pagination><AppQuickPaginator State="pagination" /></Pagination>
    </AppDataGrid>
</AsyncContent>
```

`PageHeading` is the visual heading contract for CRUD and administration
pages. Declare breadcrumb data separately with `PageBreadcrumbs`; `MainLayout`
renders that trail before the heading. `PageHeading` renders optional section identity and
`SectionActions`, the current page title and `PageActions`, then optional sibling
`Navigation`. The page title remains the single `h1`; `SectionTitle` identifies
the surrounding account, participant, case, or workspace without creating a
second heading landmark. Keep labels, routes, and action behavior in the
consuming application. Responsive changes follow each component's own container width, so
embedded previews and constrained application panes behave like real mobile
layouts even when the browser viewport is wide. Use `ExperienceHeader` for reader-facing results, education, and
guidance pages.

Use `AsyncContentState.Loading`, `Ready`, `Empty`, and `Error` to give pages one
predictable state model. Supply `LoadingContent`, `EmptyContent`, or
`ErrorContent` only when a feature needs a richer custom state.

## Forms and feedback

`AppStack`, `AppDivider`, and `AppSkeleton` cover responsive grouping, visual
separation, and loading placeholders without a third-party component runtime.
Use `AppNumberInput<TValue>` and `AppSwitch` for numeric and boolean form
fields; like the other `AppInputBase` controls, both bind to the surrounding
`EditContext` and display validation feedback.

The shared text box, text area, select, multi-select, radio group, and checkbox inherit from
Blazor's `InputBase<TValue>`. They participate in the surrounding `EditContext`,
receive the standard `modified`, `valid`, and `invalid` field classes, and show
the first validation message beside the field. They do not depend on a specific
validation framework: `DataAnnotationsValidator`, FluentValidation adapters,
or validation messages added directly to an `EditContext` can all drive the
same visual states.

`AppTextBox` and `AppSelect` also accept an optional leading `IconContent` slot.
When omitted, the control keeps its standard text padding and does not reserve
empty icon space.

```razor
<AppTextBox Label="Email" @bind-Value="model.Email">
    <IconContent><Icon Name="Mail" Size="20" /></IconContent>
</AppTextBox>

<AppSelect TValue="string" Label="Department" Options="DepartmentOptions" @bind-Value="model.Department">
    <IconContent><Icon Name="Building" Size="20" /></IconContent>
</AppSelect>

<AppMultiSelect TValue="string" Label="Roles" Options="RoleOptions" @bind-Value="model.Roles" />
```

`AppMultiSelect<TValue>` accepts `@bind-Value` as its primary `IEnumerable<TValue>`
contract. `@bind-SelectedItems` remains supported for compatibility and now
participates in the same `EditContext`, field-change, CSS-state, ARIA, and
validation-message pipeline. Do not supply both bindings to one instance.

```razor
<EditForm Model="@model" OnValidSubmit="SaveAsync">
    <DataAnnotationsValidator />
    <FormSection Title="Contact details"
                 Description="Used for assessment follow-up.">
        <FormGrid Columns="2">
            <FormField><AppTextBox Label="Email" @bind-Value="model.Email" /></FormField>
            <FormField><AppSelect TValue="string" Label="Department" Options="DepartmentOptions" @bind-Value="model.Department" /></FormField>
            <FormField ColumnSpan="2"><AppTextArea Label="Note" @bind-Value="model.Note" /></FormField>
            <FormField ColumnSpan="2"><AppRadioGroup TValue="string" Label="Contact channel" Options="ContactOptions" @bind-Value="model.Channel" /></FormField>
            <FormField ColumnSpan="2"><AppCheckbox Label="I confirm these details" @bind-Value="model.Confirmed" /></FormField>
        </FormGrid>
    </FormSection>
    <FormActions>
        <AppButton Type="ButtonType.Submit" Variant="AppButtonVariant.Primary">Save changes</AppButton>
        <AppButton OnClick="Cancel">Cancel</AppButton>
    </FormActions>
</EditForm>

<FeedbackBanner Title="Changes saved"
                Message="The participant record is up to date."
                Intent="FeedbackIntent.Success"
                Dismissible="true" />
```

Keep DataAnnotations on presentation/request models when that is convenient;
domain entities and application commands do not need to reference UI validation
attributes. This keeps Clean Architecture boundaries intact while allowing the
web boundary to reuse Blazor's built-in validation pipeline.

### Date and time controls

Use `AppCalendarPicker`, `AppTimePicker`, and `AppDateTimePicker` when a form
must remain usable during static server-side rendering. They render native HTML
inputs first, so validation and submission do not require an interactive Blazor
circuit. All three controls progressively upgrade to shared themed popups;
without JavaScript they remain normal native inputs. The calendar popup includes
direct month and year selectors, while the time and date-time popups respect
`MinuteStep`, `SecondStep`, `Min`, `Max`, and `IncludeSeconds`. When
`IncludeSeconds="true"`, the native step and popup second choices use
`SecondStep` (one second by default). Set
`Mode="AppCalendarPickerMode.Native"` on `AppCalendarPicker` when the
operating-system calendar is preferred. All visible picker text, screen-reader
labels, browser time-zone validation messages, and the locale used for
JavaScript-rendered month/day names can be provided through `AppPickerText`.
This deliberately accepts application-owned localized strings rather than
imposing a resource system on the shared library. The existing
`OpenCalendarLabel`, `OpenTimeLabel`, and `OpenDateTimeLabel` parameters remain
available as per-control trigger overrides.

```razor
<AppCalendarPicker Label="Date of birth"
                   Name="Registration.BirthDate"
                   Required="true" />

<AppDateTimePicker Label="Appointment"
                   Name="Appointment.StartsAt"
                   MinuteStep="15"
                   Required="true" />
```

For example, construct the text from the consuming application's
`IStringLocalizer` (or any localization service) and reuse it for every picker:

```razor
@using System.Globalization
@inject IStringLocalizer<SharedResources> Text

<AppDateTimePicker Label="@Text[\"Appointment\"]"
                   Text="@pickerText"
                   Name="Appointment.StartsAt" />

@code {
    private AppPickerText pickerText => new()
    {
        Locale = CultureInfo.CurrentUICulture.Name,
        OpenDateTimeLabel = Text["Open appointment picker"],
        PreviousMonthLabel = Text["Previous month"],
        NextMonthLabel = Text["Next month"],
        MonthLabel = Text["Month"],
        YearLabel = Text["Year"],
        HourLabel = Text["Hour"],
        MinuteLabel = Text["Minute"],
        SecondLabel = Text["Second"],
        NowLabel = Text["Now"],
        CancelLabel = Text["Cancel"],
        ApplyLabel = Text["Apply"],
        InvalidLocalTimeMessage = Text["This local time does not exist in the browser time zone."],
        AmbiguousLocalTimeMessage = Text["This local time occurs twice when the clock changes. Choose another time."]
    };
}
```

`AppPickerText` also exposes dialog headings, `ChooseTimeLabel`,
`BrowserLocalTimeLabel`, and `TimeLabel`; omitted properties retain the English
defaults. Pass a BCP 47 value such as `th-TH` to `Locale` to format the
progressively enhanced calendar with that locale. Native browser inputs still
follow the user's browser and operating-system settings.

The combined picker posts four fields under the supplied name:
`LocalDateTime`, `UtcDateTime`, `TimeZoneId`, and `UtcOffsetMinutes`. Bind these
to `BrowserDateTimeFormValue` on a static SSR endpoint and call
`TryGetUtcDateTimeOffset`. The helper recomputes the UTC instant from the local
wall time and IANA time-zone identifier; it does not trust client-provided UTC
and rejects daylight-saving gaps and ambiguous repeated times.

When used interactively, `Value` is intentionally a `DateTime` with
`DateTimeKind.Unspecified`: it represents browser-local wall time. Convert it
through the scoped `BrowserTimeProvider` after that provider is initialized.
Never call `ToUniversalTime()` on this value because that would use the server
process time zone in Interactive Server applications.

Use `FeedbackBanner` for contextual or dismissible page feedback and
`StatusPanel`/`AsyncContent` for states that replace the page's main content.
Use `FeedbackIntent.Error` for failed operations, `Warning` when work can
continue with caution, `Success` for confirmed completion, and `Info` for
neutral guidance.

The shared `css/main.css` establishes typography roles, responsive page
padding, semantic state colors, reduced-motion behavior, and compatibility
classes for older pages. Applications should define product colors through
`--app-brand`, `--app-brand-secondary`, `--app-brand-secondary`, and
`--app-brand` rather than replacing the shared component styles.

## Company attribution

Use `CompanyFooter` in an application's top-level layouts so ownership remains
visible on landing, authenticated, and identity pages:

```razor
<CompanyFooter CompanyName="Quack and Honk"
               CompanyUrl="https://quackandhonk.com/"
               CreatorName="Suttisak Denduangchai" />
```

The component provides responsive wrapping, keyboard focus styling, and theme-aware
colors. Applications own the company name, URL, creator name, and localized prefix.

## Theme bootstrap

Load the bootstrap script in the document `<head>` before application styles:

```razor
<script src="@Assets["_content/Suttisak.Blazor.UserInterface/js/theme-bootstrap.js"]"></script>
```

The script resolves the persisted `light`, `dark`, or `system` preference before
first paint. It writes the resolved scheme to one contract only:
`html[data-theme="light"]` or `html[data-theme="dark"]`. `ThemeSelector`
keeps that attribute current for system-preference and cross-tab changes once it
is interactive. Applications should use semantic CSS tokens for their accent
colors and retain their `<meta name="theme-color">`; do not add theme attributes
to `body` or depend on a JavaScript global.
