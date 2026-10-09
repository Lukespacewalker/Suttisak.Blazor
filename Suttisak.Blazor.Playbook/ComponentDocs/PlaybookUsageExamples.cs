namespace Suttisak.Blazor.Playbook.ComponentDocs;

public static class PlaybookUsageExamples
{
    private static readonly IReadOnlyDictionary<string, string> Examples =
        new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["AccessPageLayout"] = """
                <AccessPageLayout LoginPresentation="true" HeadingId="sign-in-title" ShowcaseLabel="Workspace introduction">
                    <Brand>@Brand</Brand>
                    <ShowcaseBrand>@ShowcaseBrand</ShowcaseBrand>
                    <Controls><PreferencesSelector Compact="true" /></Controls>
                    <HeaderActions>@AccountActions</HeaderActions>
                    <Title>Welcome back</Title>
                    <Intro>Sign in to continue.</Intro>
                    <ChildContent>@SignInForm</ChildContent>
                    <Showcase>@WorkspaceIntroduction</Showcase>
                    <SupportingContent>@SupportingCopy</SupportingContent>
                    <Footer>@OrganizationFooter</Footer>
                </AccessPageLayout>
                """,
            ["PreferencesSelector"] = """
                @* Login disclosures. HeaderOnly and CompactHeaderPreferences retain the header contract. *@
                <PreferencesSelector Compact="true" HeaderThemeLabel="Color scheme" HeaderLanguageLabel="Language" />
                """,
            ["AlternativeAccessGroup"] = """
                <AlternativeAccessGroup Label="Alternative access">
                    <div class="login-provider-block">
                        <div class="external-login-option"><AppButton OnClick="UseProviderAsync">Provider</AppButton></div>
                    </div>
                    <AppButton IconStartName="PersonPasskey" OnClick="UsePasskeyAsync">Continue with passkey</AppButton>
                </AlternativeAccessGroup>
                """,
            ["IdentityLayout"] = """
                @inherits IdentityLayout
                @{ base.BuildRenderTree(__builder); }
                @code {
                    protected override bool LoginPresentation => true;
                    protected override string HeadingId => "workspace-sign-in-title";
                    protected override string ShowcaseLabel => "Workspace introduction";
                    // HeaderRenderMode remains the host's choice.
                }
                @* Page content supplies CardEyebrowSection, CardKickerSection, CardIntroSection,
                   ShowcaseSection, ShowcaseBrandSection, HeaderActionsSection,
                   SupportingContentSection, and FooterSection. *@
                """,
            ["AppButton"] = """
                <AppButton Variant="AppButtonVariant.Primary" OnClick="SaveAsync">
                    Save changes
                </AppButton>
                """,
            ["AppTextBox"] = """
                <AppTextBox Label="Display name"
                            Description="Shown to people in this workspace."
                            @bind-Value="model.DisplayName" />
                """,
            ["AppTextArea"] = """
                <AppTextArea Label="Review note" Rows="4" MaxLength="240"
                             @bind-Value="model.Note" />
                """,
            ["AppSelect"] = """
                <AppSelect TValue="string" Label="Department"
                           Options="DepartmentOptions"
                           @bind-Value="model.Department" />
                """,
            ["AppCheckbox"] = """
                <AppCheckbox Label="I confirm the information is correct"
                             @bind-Value="model.Confirmed" />
                """,
            ["FormSection"] = """
                <FormSection Title="Contact details">
                    <FormGrid Columns="2">
                        <FormField><AppTextBox Label="Name" @bind-Value="model.Name" /></FormField>
                        <FormField><AppTextBox Label="Email" Type="email" @bind-Value="model.Email" /></FormField>
                    </FormGrid>
                    <FormActions><AppButton Type="submit">Save</AppButton></FormActions>
                </FormSection>
                """,
            ["AppGrid"] = """
                @* Table is the default. Cards require Pagination and cannot use Virtualize. *@
                <AppGrid TGridItem="Record" Items="Records" Pagination="pagination"
                         CompactLayout="AppGridCompactLayout.Cards" CompactBreakpoint="640"
                         ItemKey="record => record.Id">
                    <ChildContent>
                        <AppGridPropertyColumn Property="record => record.Name" Title="Name" Sortable="true" />
                    </ChildContent>
                    <CardTemplate Context="record">
                        <strong>@record.Name</strong>
                        <AppButton OnClick="@(_ => OpenDetailsAsync(record))">View details</AppButton>
                    </CardTemplate>
                </AppGrid>
                <AppGridPaginator State="pagination" />
                """,
            ["AppActionMenu"] = """
                <AppActionMenu AriaLabel="@($"Actions for {record.Name}")">
                    <AppButton OnClick="@(_ => EditAsync(record))">Edit</AppButton>
                    <AppButton Variant="AppButtonVariant.Danger"
                               OnClick="@(_ => ConfirmDeleteAsync(record))">Delete</AppButton>
                </AppActionMenu>
                """,
            ["AppGridSelectionToolbar"] = """
                <AppGridShell SelectionActive="@(selected.Count > 0)">
                    <Toolbar><span>@rows.Count records</span></Toolbar>
                    <SelectionToolbar>
                        <AppGridSelectionToolbar SelectedCount="@selected.Count" OnClear="ClearSelection">
                            <Actions><AppButton OnClick="ExportSelectedAsync">Export selected</AppButton></Actions>
                        </AppGridSelectionToolbar>
                    </SelectionToolbar>
                    <ChildContent>
                        <AppGrid TGridItem="Record" Items="@rows.AsQueryable()"
                                 ItemKey="record => record.Id" SelectionMode="AppGridSelectionMode.Multiple"
                                 @bind-SelectedItems="selected">
                            <AppGridPropertyColumn Property="record => record.Name" Title="Name" />
                        </AppGrid>
                    </ChildContent>
                </AppGridShell>
                """,
            ["AppDialog"] = """
                var result = await OverlayService.ShowConfirmationAsync(new AppConfirmationOptions
                {
                    Title = "Publish changes?",
                    Message = "People with access will see the new version.",
                    ConfirmText = "Publish"
                });
                """,
            ["AppDrawer"] = """
                var result = await OverlayService.ShowDrawerAsync<EditorDrawer, Record>(
                    new AppOverlayOptions
                    {
                        Title = "Record editor",
                        DrawerPosition = AppDrawerPosition.End
                    });
                """,
            ["Nav"] = """
                <Nav Embedded="true">
                    <NavGroup Label="Workspace">
                        <NavItem Href="dashboard" IconRestName="Home">Dashboard</NavItem>
                    </NavGroup>
                </Nav>
                """,
            ["PageHeading"] = """
                <PageHeading Title="Assessment overview" Description="Review the latest result.">
                    <PageActions><AppButton>Save assessment</AppButton></PageActions>
                </PageHeading>
                """,
            ["StatusPage"] = """
                <StatusPage Code="404" Variant="StatusPageVariant.Missing"
                            Title="We could not find that page."
                            Description="Check the address or return home." />
                """,
            ["MarketingHero"] = """
                <MarketingHero Title="Make the next decision clear."
                               Description="Explain the outcome before the detail.">
                    <Actions><MarketingActionLink Href="#features">View features</MarketingActionLink></Actions>
                </MarketingHero>
                """,
            ["ApplicationShell"] = """
                <ApplicationShell MainContentId="application-main">
                    <Brand>...</Brand>
                    <Navigation><Nav Embedded="true">...</Nav></Navigation>
                    <Heading><PageHeading Title="Dashboard" /></Heading>
                    <ChildContent>@Body</ChildContent>
                </ApplicationShell>
                """,
            ["LocalTime"] = """
                <LocalTime Value="record.CreatedAtUtc" Format="dd MMM yyyy, HH:mm" />
                """
        };

    public static string For(PlaybookComponentDefinition component) =>
        Examples.GetValueOrDefault(component.Name) ?? $"@* Usage skeleton: supply required parameters from the API table. *@{Environment.NewLine}<{component.Name} />";

    public static bool HasCuratedExample(PlaybookComponentDefinition component) => Examples.ContainsKey(component.Name);
}
