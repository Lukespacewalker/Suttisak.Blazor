using System.Text.Json;
using System.Text.RegularExpressions;

namespace Suttisak.Blazor.UserInterface.Tests;

public sealed partial class DesignTokenContractTests
{
    [Fact]
    public void Packaged_manifest_matches_the_public_css_contract()
    {
        var fixtureDirectory = Path.Combine(AppContext.BaseDirectory, "DesignTokenFixtures");
        var manifestPath = Path.Combine(fixtureDirectory, "design-tokens.json");
        var manifest = JsonSerializer.Deserialize<DesignTokenManifest>(
            File.ReadAllText(manifestPath),
            new JsonSerializerOptions(JsonSerializerDefaults.Web));

        Assert.NotNull(manifest);
        Assert.Equal(1, manifest.SchemaVersion);

        var manifestTokens = manifest.Categories.SelectMany(category => category.Tokens).ToArray();
        Assert.Equal(71, manifestTokens.Length);
        Assert.Equal(manifestTokens.Length, manifestTokens.Select(token => token.Name).Distinct(StringComparer.Ordinal).Count());

        var cssTokens = new Dictionary<string, string>(StringComparer.Ordinal);
        foreach (var fileName in new[] { "color.css", "application.css", "main.css" })
        {
            var css = File.ReadAllText(Path.Combine(fixtureDirectory, fileName));
            foreach (Match match in TokenDeclarationRegex().Matches(css))
            {
                cssTokens.TryAdd(match.Groups["name"].Value, Normalize(match.Groups["value"].Value));
            }
        }

        var manifestNames = manifestTokens.Select(token => token.Name).Order(StringComparer.Ordinal).ToArray();
        var cssNames = cssTokens.Keys.Where(name => name.StartsWith("--app-", StringComparison.Ordinal)).Order(StringComparer.Ordinal).ToArray();
        Assert.Equal(cssNames, manifestNames);

        foreach (var token in manifestTokens)
        {
            Assert.True(cssTokens.TryGetValue(token.Name, out var cssValue), $"Missing CSS declaration for {token.Name}");
            Assert.Equal(Normalize(token.DefaultValue), cssValue);
        }
    }

    private static string Normalize(string value) => WhitespaceRegex().Replace(value.Trim(), " ");

    [GeneratedRegex(@"(?<name>--app-[a-z0-9-]+)\s*:\s*(?<value>[^;]+);", RegexOptions.IgnoreCase | RegexOptions.CultureInvariant)]
    private static partial Regex TokenDeclarationRegex();

    [GeneratedRegex(@"\s+", RegexOptions.CultureInvariant)]
    private static partial Regex WhitespaceRegex();

    private sealed record DesignTokenManifest(int SchemaVersion, IReadOnlyList<DesignTokenCategory> Categories);
    private sealed record DesignTokenCategory(string Id, IReadOnlyList<DesignToken> Tokens);
    private sealed record DesignToken(string Name, string DefaultValue);
}
