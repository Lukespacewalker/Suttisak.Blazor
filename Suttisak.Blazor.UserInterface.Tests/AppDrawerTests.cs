using Bunit;
using Microsoft.AspNetCore.Components;
using Suttisak.Blazor.UserInterface.Components.Common;

namespace Suttisak.Blazor.UserInterface.Tests;

public class AppDrawerTests
{
    [Fact]
    public void RendersAnActionOnlyNativeDialog()
    {
        using var context = new BunitContext();
        RenderFragment<AppOverlayContext<string, string>> body = _ => builder => builder.AddContent(0, "Drawer body");

        var drawer = context.Render<AppDrawer<string, string>>(parameters => parameters
            .Add(component => component.Title, "Edit record")
            .Add(component => component.Body, body));

        var dialog = drawer.Find("dialog.app-drawer");
        Assert.Equal("false", dialog.GetAttribute("data-dismissible"));
        Assert.Equal("true", dialog.GetAttribute("data-prevent-outside-dismiss"));
        Assert.Equal("true", dialog.GetAttribute("data-prevent-native-dismiss"));
        Assert.Empty(drawer.FindAll(".app-drawer__close"));
    }
}
