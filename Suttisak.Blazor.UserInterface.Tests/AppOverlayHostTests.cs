using Bunit;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Rendering;
using Microsoft.Extensions.DependencyInjection;
using Suttisak.Blazor.UserInterface.Components.Common;
using Suttisak.Blazor.UserInterface.Services;

namespace Suttisak.Blazor.UserInterface.Tests;

public class AppOverlayHostTests
{
    [Fact]
    public void RendersDynamicDrawerBodyWithoutBlockingTheRenderCycle()
    {
        using var context = new BunitContext();
        context.Services.AddAppOverlays();

        var overlayModule = context.JSInterop.SetupModule(
            "./_content/Suttisak.Blazor.UserInterface/js/app-overlay.js");
        overlayModule.SetupVoid("showModal", _ => true).SetVoidResult();

        var host = context.Render<AppOverlayHost>();
        var service = context.Services.GetRequiredService<AppOverlayService>();

        host.InvokeAsync(() =>
        {
            _ = service.ShowDrawerAsync<TestOverlayBody, string>(
                new AppOverlayOptions
                {
                    Title = "Test drawer",
                    Dismissible = true,
                    PreventDismissOnOutsideClick = true
                },
                AppOverlayParameters.Create((nameof(TestOverlayBody.Text), "Drawer content")));
        });

        Assert.True(
            SpinWait.SpinUntil(
                () => host.FindAll("[data-testid='drawer-body']").Count > 0,
                TimeSpan.FromSeconds(1)),
            host.Markup);
        Assert.Equal("Drawer content", host.Find("[data-testid='drawer-body']").TextContent);
        var drawer = host.Find("dialog.app-drawer");
        Assert.Equal("true", drawer.GetAttribute("data-dismissible"));
        Assert.Equal("true", drawer.GetAttribute("data-prevent-outside-dismiss"));
        Assert.Single(host.FindAll(".app-drawer__close"));
    }

    public sealed class TestOverlayBody : ComponentBase
    {
        [Parameter] public string Text { get; set; } = string.Empty;

        protected override void BuildRenderTree(RenderTreeBuilder builder)
        {
            builder.OpenElement(0, "p");
            builder.AddAttribute(1, "data-testid", "drawer-body");
            builder.AddContent(2, Text);
            builder.CloseElement();
        }
    }
}
