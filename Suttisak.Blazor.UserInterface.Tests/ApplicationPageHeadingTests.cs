using Bunit;
using Microsoft.AspNetCore.Components;
using Suttisak.Blazor.UserInterface.Components.Common;
using Suttisak.Blazor.UserInterface.Components.Experience;
using Suttisak.Blazor.UserInterface.Layouts.Shared;
using Suttisak.Blazor.UserInterface.Models;

namespace Suttisak.Blazor.UserInterface.Tests;

public sealed class ApplicationPageHeadingTests
{
    [Fact]
    public void Breadcrumbs_and_page_heading_share_one_application_heading_surface()
    {
        using var context = new BunitContext();
        var breadcrumbs = new Breadcrumb[]
        {
            new(null, "/records", "Records"),
            new(null, null, "Current record")
        };

        var cut = context.Render<ApplicationPageHeading>(parameters => parameters
            .Add(component => component.Breadcrumbs, breadcrumbs)
            .Add(component => component.BreadcrumbLabel, "Page location")
            .Add(component => component.ChildContent, PageHeadingContent()));

        var surface = cut.Find(".application-page-heading--with-breadcrumbs");
        Assert.NotNull(surface.QuerySelector(".application-page-heading__visual .page-heading"));
        Assert.Equal("Page location", cut.Find("nav").GetAttribute("aria-label"));
        Assert.Equal("page", cut.Find("[aria-current]").GetAttribute("aria-current"));
    }

    [Fact]
    public void Experience_heading_can_use_the_same_visual_slot_without_breadcrumb_markup()
    {
        using var context = new BunitContext();
        var cut = context.Render<ApplicationPageHeading>(parameters => parameters
            .Add(component => component.ChildContent, ExperienceHeadingContent()));

        Assert.Empty(cut.FindAll("nav"));
        Assert.NotNull(cut.Find(".application-page-heading__visual .experience-heading"));
    }

    private static RenderFragment PageHeadingContent() => builder =>
    {
        builder.OpenComponent<PageHeading>(0);
        builder.AddAttribute(1, nameof(PageHeading.Title), "Current record");
        builder.CloseComponent();
    };

    private static RenderFragment ExperienceHeadingContent() => builder =>
    {
        builder.OpenComponent<ExperienceHeading>(0);
        builder.AddAttribute(1, nameof(ExperienceHeading.Title), "Assessment result");
        builder.CloseComponent();
    };
}
