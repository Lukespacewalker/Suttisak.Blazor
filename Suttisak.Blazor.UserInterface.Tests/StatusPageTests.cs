using Bunit;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Rendering;
using Suttisak.Blazor.UserInterface.Routing;

namespace Suttisak.Blazor.UserInterface.Tests;

public sealed class StatusPageTests
{
    [Fact]
    public void Custom_content_is_rendered_through_named_slots_and_heading_is_associated()
    {
        using var context = new BunitContext();
        var cut = context.Render<StatusPage>(parameters => parameters
            .Add(component => component.Code, "maintenance")
            .AddUnmatched("class", "custom-status-page")
            .Add(component => component.Title, "Back soon")
            .Add(component => component.Description, "The workspace is being updated.")
            .Add(component => component.BrandContent, Content("Product brand"))
            .Add(component => component.VisualContent, Content("Custom visual"))
            .Add(component => component.Actions, Content("Return home"))
            .Add(component => component.SupplementaryContent, Content("Reference MAINT-1"))
            .Add(component => component.FooterContent, Content("Footer guidance")));

        var root = cut.Find("section.status-page");
        var heading = cut.Find("h1");

        Assert.Equal("region", root.GetAttribute("role"));
        Assert.Contains("custom-status-page", root.ClassName, StringComparison.Ordinal);
        Assert.Equal("polite", root.GetAttribute("aria-live"));
        Assert.Equal(heading.Id, root.GetAttribute("aria-labelledby"));
        Assert.Equal("The workspace is being updated.", cut.Find("p").TextContent);
        Assert.Contains("Product brand", cut.Markup, StringComparison.Ordinal);
        Assert.Contains("Custom visual", cut.Markup, StringComparison.Ordinal);
        Assert.Contains("Return home", cut.Find(".status-page__actions").TextContent, StringComparison.Ordinal);
        Assert.Contains("Reference MAINT-1", cut.Find(".status-page__supplementary").TextContent, StringComparison.Ordinal);
        Assert.Contains("Footer guidance", cut.Find("footer").TextContent, StringComparison.Ordinal);
    }

    [Fact]
    public void Error_variant_infers_assertive_alert_semantics_and_explicit_values_override_them()
    {
        using var context = new BunitContext();
        var cut = context.Render<StatusPage>(parameters => parameters
            .Add(component => component.Variant, StatusPageVariant.Error)
            .Add(component => component.Title, "Unexpected error"));

        var root = cut.Find("section.status-page");
        Assert.Contains("status-page--error", root.ClassName, StringComparison.Ordinal);
        Assert.Equal("alert", root.GetAttribute("role"));
        Assert.Equal("assertive", root.GetAttribute("aria-live"));

        cut.Render(parameters => parameters
            .Add(component => component.Variant, StatusPageVariant.Error)
            .Add(component => component.Role, "status")
            .Add(component => component.AriaLive, "polite")
            .Add(component => component.Title, "Still available"));

        root = cut.Find("section.status-page");
        Assert.Equal("status", root.GetAttribute("role"));
        Assert.Equal("polite", root.GetAttribute("aria-live"));
    }

    [Fact]
    public void Route_adapter_maps_http_status_and_keeps_request_reference_behavior()
    {
        using var context = new BunitContext();
        var options = new StatusRouteOptions
        {
            BrandName = "Demo app",
            ShowRequestId = true
        };
        options.Error.Title = "Could not prepare report";
        options.Error.Message = "Try again later.";

        var cut = context.Render<StatusRouteContent>(parameters => parameters
            .Add(component => component.StatusCode, 500)
            .Add(component => component.RequestId, "ERR-123")
            .Add(component => component.Options, options));

        Assert.Contains("status-page--error", cut.Find("section.status-page").ClassName, StringComparison.Ordinal);
        Assert.Equal("Could not prepare report", cut.Find("h1").TextContent);
        Assert.Equal("Try again later.", cut.Find("p").TextContent);
        Assert.Contains("Demo app", cut.Find(".status-page__brand").TextContent, StringComparison.Ordinal);
        Assert.Equal("ERR-123", cut.Find(".status-page__reference code").TextContent);
        Assert.NotNull(cut.Find("button.status-page__primary"));
    }

    private static RenderFragment Content(string text) => builder =>
    {
        builder.OpenElement(0, "span");
        builder.AddContent(1, text);
        builder.CloseElement();
    };
}
