# Application UI primitives

`Suttisak.Blazor.UserInterface` supplies the shared application contract used by
the occupational-health product family.

## Page composition

```razor
<PageHeading Title="Participants"
             Description="Manage people in the current assessment period"
             Icon="@(new Icons.Regular.Size24.People())" />

<Toolbar AriaLabel="Manage participants">
    <FluentButton Appearance="Appearance.Accent">Add participant</FluentButton>
</Toolbar>

<AsyncContent State="@ContentState"
              LoadingTitle="Loading participants"
              EmptyTitle="No participants yet"
              EmptyMessage="Add a participant to begin."
              EmptyIcon="@(new Icons.Regular.Size24.People())"
              ErrorTitle="Participants could not be loaded"
              ErrorMessage="@errorMessage"
              OnRetry="LoadAsync">
    <DataGridContainer>
        <FluentDataGrid Items="@participants.AsQueryable()" />
    </DataGridContainer>
</AsyncContent>
```

Use `AsyncContentState.Loading`, `Ready`, `Empty`, and `Error` to give pages one
predictable state model. Supply `LoadingContent`, `EmptyContent`, or
`ErrorContent` only when a feature needs a richer custom state.

## Forms and feedback

```razor
<EditForm Model="@model" OnValidSubmit="SaveAsync">
    <DataAnnotationsValidator />
    <FormValidationSummary />
    <FormSection Title="Contact details"
                 Description="Used for assessment follow-up.">
        <FormGrid Columns="2">
            <FluentTextField Label="Email" @bind-Value="model.Email" />
            <FluentTextField Label="Telephone" @bind-Value="model.Telephone" />
        </FormGrid>
    </FormSection>
    <FormActions>
        <FluentButton Type="ButtonType.Submit"
                      Appearance="ButtonAppearance.Primary">Save changes</FluentButton>
        <FluentButton OnClick="Cancel">Cancel</FluentButton>
    </FormActions>
</EditForm>

<FeedbackBanner Title="Changes saved"
                Message="The participant record is up to date."
                Intent="FeedbackIntent.Success"
                Dismissible="true" />
```

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
