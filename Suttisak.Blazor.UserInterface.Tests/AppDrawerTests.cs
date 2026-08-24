using Bunit;
using Microsoft.AspNetCore.Components;
using Suttisak.Blazor.UserInterface.Components.Common;

namespace Suttisak.Blazor.UserInterface.Tests;

public class AppDrawerTests
{
    [Fact]
    public void RendersConfiguredDismissalControls()
    {
        using var context = new BunitContext();
        var overlayModule = context.JSInterop.SetupModule(
            "./_content/Suttisak.Blazor.UserInterface/js/app-overlay.js");
        overlayModule.SetupVoid("showModal", _ => true).SetVoidResult();
        RenderFragment<AppOverlayContext<string, string>> body = _ => builder => builder.AddContent(0, "Drawer body");

        var drawer = context.Render<AppDrawer<string, string>>(parameters => parameters
            .Add(component => component.Title, "Edit record")
            .Add(component => component.Body, body)
            .Add(component => component.Dismissible, true)
            .Add(component => component.PreventDismissOnOutsideClick, true)
            .Add(component => component.CloseLabel, "Discard changes"));

        drawer.InvokeAsync(() =>
        {
            _ = drawer.Instance.ShowAsync("Draft");
        });

        Assert.True(
            SpinWait.SpinUntil(
                () => drawer.FindAll(".app-drawer__close").Count > 0,
                TimeSpan.FromSeconds(1)),
            drawer.Markup);

        var dialog = drawer.Find("dialog.app-drawer");
        Assert.Equal("true", dialog.GetAttribute("data-dismissible"));
        Assert.Equal("true", dialog.GetAttribute("data-prevent-outside-dismiss"));
        Assert.Single(drawer.FindAll(".app-drawer__close"));
        Assert.Equal("Discard changes", drawer.Find(".app-drawer__close").GetAttribute("aria-label"));
    }
}
