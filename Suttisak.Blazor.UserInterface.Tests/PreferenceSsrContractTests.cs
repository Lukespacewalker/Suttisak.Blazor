namespace Suttisak.Blazor.UserInterface.Tests;

public sealed class PreferenceSsrContractTests
{
    private static readonly string RepositoryRoot = FindRepositoryRoot();

    [Fact]
    public void Preference_components_use_static_ssr_progressive_enhancement()
    {
        var culture = Read("Suttisak.Blazor.UserInterface", "Components", "CultureSelector.razor");
        var theme = Read("Suttisak.Blazor.UserInterface", "Components", "ThemeSwitcher.razor");
        var utilities = Read("Suttisak.Blazor.UserInterface", "wwwroot", "js", "blazor-utilities.js");
        var bootstrap = Read("Suttisak.Blazor.UserInterface", "wwwroot", "js", "theme-bootstrap.js");

        Assert.Contains("method=\"get\"", culture, StringComparison.Ordinal);
        Assert.Contains("data-culture-preference=\"auto\"", culture, StringComparison.Ordinal);
        Assert.DoesNotContain("@onclick", culture, StringComparison.Ordinal);
        Assert.Contains("data-theme-preference=\"system\"", theme, StringComparison.Ordinal);
        Assert.DoesNotContain("@onclick", theme, StringComparison.Ordinal);
        Assert.Contains("navigator.languages", utilities, StringComparison.Ordinal);
        Assert.Contains("data-theme-preference", bootstrap, StringComparison.Ordinal);
    }

    [Fact]
    public void Applications_can_configure_their_default_culture()
    {
        var options = new Services.BlazorUIOptions();

        Assert.Equal("en-US", options.DefaultCulture);
        Assert.Equal("Culture/Set", options.CultureSetUrl);
    }

    private static string Read(params string[] path) => File.ReadAllText(Path.Combine([RepositoryRoot, .. path]));

    private static string FindRepositoryRoot()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null && !File.Exists(Path.Combine(directory.FullName, "Suttisak.Blazor.slnx")))
            directory = directory.Parent;
        return directory?.FullName ?? throw new InvalidOperationException("Repository root not found.");
    }
}
