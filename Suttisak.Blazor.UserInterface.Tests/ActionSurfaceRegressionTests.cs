using Bunit;
using Suttisak.Blazor.UserInterface.Components.Common;

namespace Suttisak.Blazor.UserInterface.Tests;

public sealed class ActionSurfaceRegressionTests
{
    [Theory]
    [InlineData(true, false)]
    [InlineData(false, true)]
    public void Busy_or_loading_links_cannot_navigate(bool busy, bool loading)
    {
        using var context = new BunitContext();
        var component = context.Render<AppButton>(parameters => parameters
            .Add(button => button.Href, "/records")
            .Add(button => button.Busy, busy)
            .Add(button => button.Loading, loading)
            .AddUnmatched("data-action", "open-records")
            .AddChildContent("Open records"));

        var link = component.Find("a");
        Assert.False(link.HasAttribute("href"));
        Assert.Equal("true", link.GetAttribute("aria-disabled"));
        Assert.Equal("true", link.GetAttribute("aria-busy"));
        Assert.Equal("-1", link.GetAttribute("tabindex"));
        Assert.Equal("open-records", link.GetAttribute("data-action"));

        component.Render(parameters => parameters
            .Add(button => button.Busy, false)
            .Add(button => button.Loading, false));

        Assert.Equal("/records", component.Find("a").GetAttribute("href"));
    }

    [Fact]
    public void Busy_link_keeps_its_disabled_state_with_splatted_attributes()
    {
        using var context = new BunitContext();
        var component = context.Render<AppButton>(parameters => parameters
            .Add(button => button.Href, "/records")
            .Add(button => button.Busy, true)
            .Add(button => button.AdditionalAttributes, new Dictionary<string, object>
            {
                ["href"] = "/elsewhere",
                ["aria-disabled"] = "false",
                ["aria-busy"] = "false",
                ["tabindex"] = 0
            }));

        var link = component.Find("a");
        Assert.False(link.HasAttribute("href"));
        Assert.Equal("true", link.GetAttribute("aria-disabled"));
        Assert.Equal("true", link.GetAttribute("aria-busy"));
        Assert.Equal("-1", link.GetAttribute("tabindex"));
    }

    [Fact]
    public void Icon_only_button_renders_child_glyph_when_no_icon_is_supplied()
    {
        using var context = new BunitContext();
        var component = context.Render<AppButton>(parameters => parameters
            .Add(button => button.IconOnly, true)
            .Add(button => button.AriaLabel, "Clear")
            .AddChildContent("×"));

        Assert.Equal("×", component.Find(".app-button__icon").TextContent);

        component.Render(parameters => parameters.Add(button => button.Busy, true));
        Assert.Empty(component.FindAll(".app-button__icon"));
        Assert.Single(component.FindAll(".app-button__spinner"));
    }

    [Fact]
    public void Card_actions_render_without_a_title()
    {
        using var context = new BunitContext();
        var component = context.Render<AppCard>(parameters => parameters
            .Add(card => card.Actions, builder => builder.AddMarkupContent(0, "<button>Export</button>"))
            .AddChildContent("Results"));

        Assert.Equal("Export", component.Find(".app-card__header button").TextContent);
        Assert.Equal("Results", component.Find(".app-card__body").TextContent);
        Assert.Empty(component.FindAll("h2"));
    }
}
