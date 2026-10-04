using Bunit;
using Microsoft.Extensions.DependencyInjection;
using Suttisak.Blazor.UserInterface.Components;
using Suttisak.Blazor.UserInterface.Region;
using Suttisak.Blazor.UserInterface.Services;
using Suttisak.Blazor.UserInterface.Layouts.Shared;

namespace Suttisak.Blazor.UserInterface.Tests;

public sealed class PreferenceSsrContractTests
{
    private static readonly string RepositoryRoot = FindRepositoryRoot();

    [Fact]
    public void Header_control_exposes_only_language_and_scheme_in_both_responsive_surfaces()
    {
        using var context = new BunitContext();
        context.Services.AddOptions<BlazorUIOptions>();
        var cut = context.Render<HeaderControl>();

        Assert.Empty(cut.FindAll("select"));
        Assert.Equal(2, cut.FindAll(".culture-selector").Count);
        Assert.Equal(2, cut.FindAll("[data-theme-selector]").Count);
        Assert.Equal(6, cut.FindAll("[data-theme-preference]").Count);
    }

    [Theory]
    [InlineData(false)]
    [InlineData(true)]
    public void Header_controls_share_opt_in_native_popovers_and_keep_their_mobile_disclosure(bool withUser)
    {
        using var context = new BunitContext();
        context.Services.AddOptions<BlazorUIOptions>().Configure(options => options.CompactHeaderPreferences = true);
        context.AddAuthorization();
        var cut = withUser
            ? context.Render<HeaderControlWithUser>().Find(".preferences-selector")
            : context.Render<HeaderControl>().Find(".preferences-selector");

        Assert.Equal(2, cut.QuerySelectorAll("[popover='auto']").Length);
        Assert.Equal(2, cut.QuerySelectorAll(".preferences-selector__desktop [data-shell-preference]").Length);
        Assert.Single(cut.QuerySelectorAll(".preferences-selector__mobile"));
        Assert.Empty(cut.QuerySelectorAll(".preferences-selector__mobile [popover]"));
        Assert.Equal(2, cut.QuerySelectorAll(".preferences-selector__mobile .culture-selector, .preferences-selector__mobile [data-theme-selector]").Length);
    }

    [Theory]
    [InlineData(false)]
    [InlineData(true)]
    public void Header_control_with_user_keeps_identity_actions_without_preference_dropdowns(bool authenticated)
    {
        using var context = new BunitContext();
        context.Services.AddOptions<BlazorUIOptions>();
        var authorization = context.AddAuthorization();
        if (authenticated) authorization.SetAuthorized("Example user");
        var cut = context.Render<HeaderControlWithUser>(parameters => parameters
            .Add(component => component.LoginUrl, "/Account/Login")
            .Add(component => component.LoginText, "Sign in"));

        Assert.Empty(cut.FindAll("select"));
        Assert.Equal(2, cut.FindAll(".preferences-selector .culture-selector").Count);
        Assert.Equal(2, cut.FindAll(".preferences-selector [data-theme-selector]").Count);
        if (authenticated) Assert.NotNull(cut.Find(".profile-menu"));
        else Assert.Equal("/Account/Login", cut.Find("a.app-button").GetAttribute("href"));
    }

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
        Assert.False(options.CompactHeaderPreferences);
    }

    [Theory]
    [InlineData(false)]
    [InlineData(true)]
    public void MainLayout_passes_opt_in_header_preferences_without_wrapping_mobile_pickers(bool compact)
    {
        using var context = new BunitContext();
        context.Services.AddOptions<BlazorUIOptions>().Configure(options =>
        {
            options.CompactHeaderPreferences = compact;
            options.HeaderThemeLabel = "สีหน้าจอ";
            options.HeaderLanguageLabel = "ภาษา";
        });
        context.AddAuthorization();
        var cut = context.Render<MainLayout>();

        Assert.Equal(compact ? 2 : 0, cut.FindAll("[popover='auto']").Count);
        Assert.Equal(2, cut.FindAll(".app-shell__navigation-preferences [data-theme-selector], .app-shell__navigation-preferences .culture-selector").Count);
        Assert.Empty(cut.FindAll(".app-shell__navigation-preferences [popover]"));
        if (compact)
        {
            Assert.Equal("สีหน้าจอ", cut.Find("[data-shell-preference='theme']").GetAttribute("aria-label"));
            Assert.Equal("ภาษา", cut.Find("[data-shell-preference='language']").GetAttribute("aria-label"));
            Assert.Equal(cut.Find("[data-shell-preference='theme']").GetAttribute("popovertarget"), cut.Find("[data-shell-preference-popup='theme']").Id);
        }
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
