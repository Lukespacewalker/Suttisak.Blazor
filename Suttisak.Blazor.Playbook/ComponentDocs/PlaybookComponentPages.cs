namespace Suttisak.Blazor.Playbook.ComponentDocs;

public sealed record PlaybookComponentPage(
    string Name,
    string Summary,
    IReadOnlyList<PlaybookComponentDefinition> Members)
{
    public PlaybookComponentDefinition Primary => Members[0];
    public string Slug => Primary.Slug;
    public string Category => Primary.Category;
    public string Href => $"components/{Slug}";
    public string MemberHref(PlaybookComponentDefinition member) => $"{Href}#api-{member.Slug}";
}

/// <summary>Documentation families are explicit: sharing a specimen alone does not make components one subject.</summary>
public static class PlaybookComponentPages
{
    public static IReadOnlyList<PlaybookComponentPage> All { get; } = BuildPages();

    public static PlaybookComponentPage? Find(string? componentSlug) => All.FirstOrDefault(page =>
        page.Members.Any(member => member.Slug.Equals(componentSlug, StringComparison.OrdinalIgnoreCase)));

    public static string HrefFor(PlaybookComponentDefinition component)
    {
        var page = Find(component.Slug)!;
        return component.Slug == page.Slug ? page.Href : page.MemberHref(component);
    }

    public static bool Matches(PlaybookComponentPage page, string? query) =>
        string.IsNullOrWhiteSpace(query)
        || page.Name.Contains(query.Trim(), StringComparison.OrdinalIgnoreCase)
        || page.Summary.Contains(query.Trim(), StringComparison.OrdinalIgnoreCase)
        || page.Members.Any(member => Matches(member, query));

    public static bool Matches(PlaybookComponentDefinition member, string? query)
    {
        if (string.IsNullOrWhiteSpace(query)) return true;
        var term = query.Trim();
        return new[] { member.Name, member.Category, member.Summary, member.SourceArea }
            .Concat(member.Tags).Any(value => value.Contains(term, StringComparison.OrdinalIgnoreCase));
    }

    public static string SearchHref(PlaybookComponentPage page, string? query)
    {
        if (string.IsNullOrWhiteSpace(query)) return page.Href;
        var match = page.Members.FirstOrDefault(member => member.Name.Equals(query.Trim(), StringComparison.OrdinalIgnoreCase))
            ?? page.Members.FirstOrDefault(member => Matches(member, query));
        return match is null || match == page.Primary ? page.Href : page.MemberHref(match);
    }

    private static IReadOnlyList<PlaybookComponentPage> BuildPages()
    {
        PlaybookComponentPage Group(string name, string summary, params string[] members) => new(name, summary,
            members.Select(name => PlaybookComponentCatalog.All.Single(component => component.Name == name)).ToArray());

        PlaybookComponentPage[] families =
        [
            Group("Select", "Single-choice selection with typed options, labels, validation, and disabled states.", "AppSelect", "AppSelectItem"),
            Group("Radio", "An exclusive choice using a labelled group and its individual radio options.", "AppRadioGroup", "AppRadio"),
            Group("Tabs", "Tab selection, panel content, and keyboard navigation in one composition.", "AppTabs", "AppTab"),
            Group("Navigation", "Compose application destinations with groups, items, and expandable branches.", "Nav", "NavGroup", "NavItem", "NavSubmenu"),
            Group("Data Grid", "Build a searchable, sortable table with columns, pagination, and shared grid framing.", "AppGrid", "AppGridShell", "AppGridPropertyColumn", "AppGridTemplateColumn", "AppGridPaginator"),
            Group("Form Composition", "Compose field layouts, validation feedback, and form actions around an EditForm.", "FormSection", "FormGrid", "FormField", "FormActions", "FormValidationSummary"),
            Group("Date & Time Pickers", "Compare date, time, and combined date-time inputs with shared localization and precision controls.", "AppCalendarPicker", "AppTimePicker", "AppDateTimePicker"),
            Group("Marketing Proof", "Compose a strip of application-owned metrics, credentials, or outcomes.", "MarketingProofStrip", "MarketingProofItem"),
            Group("Marketing Steps", "Present an ordered sequence with a step list and individual steps.", "MarketingStepList", "MarketingStep")
        ];

        return PlaybookComponentCatalog.All.Select(component =>
                families.FirstOrDefault(page => page.Members.Contains(component))
                ?? new PlaybookComponentPage(component.Name, component.Summary, [component]))
            .DistinctBy(page => page.Slug).ToArray();
    }
}
