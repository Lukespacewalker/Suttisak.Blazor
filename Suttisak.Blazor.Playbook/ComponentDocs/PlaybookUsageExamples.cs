namespace Suttisak.Blazor.Playbook.ComponentDocs;

public static class PlaybookUsageExamples
{
    private static readonly IReadOnlyDictionary<string, string> Examples =
        new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
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
                <AppGrid TGridItem="Record" Items="Records" Virtualize="true" ItemSize="40">
                    <AppGridPropertyColumn Property="record => record.Name" Title="Name" />
                </AppGrid>
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
