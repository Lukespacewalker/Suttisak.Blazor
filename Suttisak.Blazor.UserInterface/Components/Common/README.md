# Application UI primitives

## Cards and data grids

Use `AppCard` for standard application surfaces. It provides optional header,
description, actions, body, and footer regions. `AppQuickGrid<TGridItem>` is the
preferred sorting, paging, and virtualization engine. It wraps Microsoft's
official Blazor QuickGrid with the shared visual contract and does not depend on
Fluent DataGrid. `AppDataGrid` remains the responsive command-bar and state
container, so existing Fluent grids can be migrated one screen at a time.

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

## Dialogs and drawers

`AppDialog<TInput, TResult>` and `AppDrawer<TInput, TResult>` accept a value in
`ShowAsync` and return `AppOverlayResult<TResult>`. Cancelling with Escape, the
backdrop, the close button, or `CancelAsync` returns `IsCancelled = true`.
Set `Dismissible="false"` when the user must explicitly choose a footer action.
Set `Dangerous="true"` for destructive confirmation and pair it with a danger
button. Drawers can open from either side and have narrow, standard, and wide
sizes.

```razor
<AppDialog TInput="Person" TResult="Person" @ref="deleteDialog"
           Title="Delete this person?" Dangerous="true">
    <Body Context="dialog"><p>@dialog.Value.Name will be removed.</p></Body>
    <Footer Context="dialog">
        <AppButton OnClick="@(_ => dialog.CancelAsync())">Cancel</AppButton>
        <AppButton Variant="AppButtonVariant.Danger"
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
event handlers. Use Fluent controls when their behavior is the main value—for
example `FluentDataGrid`, menu positioning, dialogs, and complex form inputs.

```razor
<AppButton Variant="AppButtonVariant.Primary" OnClick="CreateParticipant">
    <IconStart><FluentIcon Value="@(new Icons.Regular.Size20.Add())" /></IconStart>
    <ChildContent>Add participant</ChildContent>
</AppButton>

<AppButton Href="participants/export" Variant="AppButtonVariant.Secondary">
    <IconStart><FluentIcon Value="@(new Icons.Regular.Size20.ArrowDownload())" /></IconStart>
    <ChildContent>Export</ChildContent>
</AppButton>

<AppButton Variant="AppButtonVariant.Subtle"
           Size="AppButtonSize.Compact"
           IconOnly="true"
           AriaLabel="Edit participant">
    <IconStart><FluentIcon Value="@(new Icons.Regular.Size20.Edit())" /></IconStart>
</AppButton>
```

Always provide `AriaLabel` when `IconOnly` is enabled. `Href` renders a link;
without it the component renders a native button. The component intentionally
does not wrap FluentButton so application branding does not depend on Fluent's
visual overrides.

For four or more page actions, use `PageActionToolbar`: keep one action in
`PrimaryAction`, at most two frequent actions in `SupportingActions`, and place
the remainder in `OverflowActions`. In narrow containers only the primary action
and overflow trigger remain visible; supporting actions are repeated inside the
menu. Put destructive actions last.

## Page composition

```razor
<PageHeading SectionTitle="Assessment workspace"
             SectionDescription="Administration"
             SectionIcon="@(new Icons.Regular.Size20.Briefcase())"
             Title="Participants"
             Description="Manage people in the current assessment period"
             Icon="@(new Icons.Regular.Size24.People())">
    <Breadcrumbs><AppBreadcrumb Items="@breadcrumbs" /></Breadcrumbs>
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

`PageHeading` is the application hierarchy contract for CRUD and administration
pages. It renders breadcrumb context, optional section identity and
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

The shared text box, text area, select, radio group, and checkbox inherit from
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
    <IconContent><FluentIcon Value="@(new Icons.Regular.Size20.Mail())" /></IconContent>
</AppTextBox>

<AppSelect TValue="string" Label="Department" Options="DepartmentOptions" @bind-Value="model.Department">
    <IconContent><FluentIcon Value="@(new Icons.Regular.Size20.Building())" /></IconContent>
</AppSelect>
```

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
operating-system calendar is preferred. Accessible trigger labels can be
customized with `OpenCalendarLabel`, `OpenTimeLabel`, and `OpenDateTimeLabel`.

```razor
<AppCalendarPicker Label="Date of birth"
                   Name="Registration.BirthDate"
                   Required="true" />

<AppDateTimePicker Label="Appointment"
                   Name="Appointment.StartsAt"
                   MinuteStep="15"
                   Required="true" />
```

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

It only resolves the persisted Fluent UI mode before first paint. The library's
automatically loaded `Suttisak.Blazor.UserInterface.lib.module.js` initializer
then synchronizes the document and body theme attributes, follows system-theme
and cross-tab changes, observes the Fluent design-theme element, and exposes
`window.suttisakTheme`.
