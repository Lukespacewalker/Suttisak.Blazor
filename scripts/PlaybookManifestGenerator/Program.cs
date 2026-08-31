using System.Text.Json;
using Suttisak.Blazor.Playbook.ComponentDocs;

var repositoryRoot = FindRepositoryRoot(AppContext.BaseDirectory);
var outputPath = args.Length > 0
    ? Path.GetFullPath(args[0])
    : Path.Combine(repositoryRoot, "Suttisak.Blazor.Playbook", "wwwroot", "component-manifest.json");

var components = PlaybookComponentCatalog.All
    .Select(component => new
    {
        component.Name,
        component.Slug,
        component.Category,
        Status = component.Status.ToString().ToLowerInvariant(),
        Coverage = component.Coverage.ToString().ToLowerInvariant(),
        component.Summary,
        component.Tags,
        component.SourceArea,
        component.RelatedPatternIds
    })
    .ToArray();

var groups = PlaybookComponentCatalog.Groups
    .Select(group =>
    {
        var statuses = group.Select(component => component.Status.ToString().ToLowerInvariant())
            .Distinct(StringComparer.Ordinal)
            .ToArray();
        return new
        {
            Category = group.Key,
            Status = statuses.Length == 1 ? statuses[0] : "mixed",
            Components = group.Select(component => component.Name).ToArray()
        };
    })
    .ToArray();

var patterns = PlaybookPatternCatalog.All
    .Select(pattern => new
    {
        pattern.Name,
        pattern.Slug,
        pattern.Category,
        Maturity = pattern.Maturity.ToString().ToLowerInvariant(),
        pattern.Summary,
        pattern.Intent,
        pattern.Tags,
        Ingredients = pattern.Ingredients.Select(ingredient => new
        {
            ingredient.ComponentId,
            ingredient.ComponentName,
            ingredient.Role
        }),
        pattern.CompositionSteps,
        pattern.Ownership,
        pattern.MinimalRazorRecipe,
        pattern.QualityChecks,
        pattern.LiveHref,
        pattern.LiveLabel,
        pattern.Evidence
    })
    .ToArray();

var manifest = new
{
    SchemaVersion = 1,
    ComponentCount = components.Length,
    DetailRouteTemplate = "components/{kebab-case-component-name}",
    StatusPolicy = new Dictionary<string, string>
    {
        ["stable"] = "normal consumption; breaking changes require deliberate migration",
        ["beta"] = "usable but public API or composition may still move",
        ["experimental"] = "exploration only; broad dependency is discouraged",
        ["deprecated"] = "existing use may remain temporarily; new use should move to the documented replacement"
    },
    Components = components,
    Groups = groups,
    Patterns = patterns
};

Directory.CreateDirectory(Path.GetDirectoryName(outputPath)!);
await File.WriteAllTextAsync(
    outputPath,
    JsonSerializer.Serialize(manifest, new JsonSerializerOptions(JsonSerializerDefaults.Web) { WriteIndented = true }) + Environment.NewLine);

Console.WriteLine($"Wrote {components.Length} components and {patterns.Length} patterns to {outputPath}");

static string FindRepositoryRoot(string startPath)
{
    var directory = new DirectoryInfo(startPath);
    while (directory is not null)
    {
        if (File.Exists(Path.Combine(directory.FullName, "Suttisak.Blazor.slnx")))
        {
            return directory.FullName;
        }

        directory = directory.Parent;
    }

    throw new InvalidOperationException("Could not locate Suttisak.Blazor.slnx from the generator output directory.");
}
