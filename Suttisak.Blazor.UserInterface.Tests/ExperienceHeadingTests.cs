using Bunit;
using Suttisak.Blazor.UserInterface.Components.Experience;

namespace Suttisak.Blazor.UserInterface.Tests;

public sealed class ExperienceHeadingTests
{
    [Fact]
    public void Absent_visual_is_distinguished_from_the_decorative_orbit_markup()
    {
        using var context = new BunitContext();
        var cut = context.Render<ExperienceHeading>(parameters => parameters
            .Add(component => component.Title, "Current result")
            .Add(component => component.HeadingId, "current-result")
            .Add(component => component.Class, "host-heading"));

        Assert.Contains("experience-heading--without-visual", cut.Find("header").ClassList);
        Assert.Contains("host-heading", cut.Find("header").ClassList);
        Assert.Equal("current-result", cut.Find("header").GetAttribute("aria-labelledby"));
        Assert.Equal(2, cut.FindAll(".experience-heading__orbit").Count);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public void Supplied_visual_keeps_its_content_and_accessibility_treatment(bool decorative)
    {
        using var context = new BunitContext();
        var cut = context.Render<ExperienceHeading>(parameters => parameters
            .Add(component => component.Title, "Current result")
            .Add(component => component.VisualIsDecorative, decorative)
            .Add(component => component.Visual, builder => builder.AddMarkupContent(0, "<span>82 out of 100</span>")));

        Assert.DoesNotContain("experience-heading--without-visual", cut.Find("header").ClassList);
        Assert.Equal(decorative ? "true" : "false", cut.Find(".experience-heading__visual").GetAttribute("aria-hidden"));
        Assert.Contains("82 out of 100", cut.Find(".experience-heading__visual").TextContent);
    }
}
