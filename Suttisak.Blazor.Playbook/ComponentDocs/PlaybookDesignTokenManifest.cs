namespace Suttisak.Blazor.Playbook.ComponentDocs;

public sealed record PlaybookDesignTokenManifest(
    int SchemaVersion,
    string Name,
    string CssEntryPoint,
    string Description,
    IReadOnlyList<PlaybookDesignTokenCategory> Categories)
{
    public IReadOnlyList<PlaybookDesignToken> Tokens => Categories.SelectMany(category => category.Tokens).ToArray();
    public int TokenCount => Categories.Sum(category => category.Tokens.Count);
}

public sealed record PlaybookDesignTokenCategory(
    string Id,
    string Label,
    string Description,
    IReadOnlyList<PlaybookDesignToken> Tokens);

public sealed record PlaybookDesignToken(
    string Name,
    string Label,
    string DefaultValue,
    string Kind,
    string Description);
