using Bunit;
using Microsoft.AspNetCore.Components;
using Suttisak.Blazor.UserInterface.Components.Navigation;

namespace Suttisak.Blazor.UserInterface.Tests;

public sealed class NavigationContractTests
{
    [Fact]
    public void Nav_group_owns_the_shared_label_and_item_hierarchy()
    {
        using var context = new BunitContext();
        var cut = context.Render<NavGroup>(parameters => parameters
            .Add(component => component.Label, "Workspace")
            .Add(component => component.ChildContent, NavItemContent("/records", "Records")));

        Assert.Equal("Workspace", cut.Find(".nav-group__label").TextContent);
        Assert.Equal("Records", cut.Find(".nav-group__items .nav-item").TextContent.Trim());
    }

    [Fact]
    public void Nav_submenu_accepts_shared_nav_items_and_native_disclosure()
    {
        using var context = new BunitContext();
        var cut = context.Render<NavSubmenu>(parameters => parameters
            .Add(component => component.Label, "Administration")
            .Add(component => component.IconName, "Settings")
            .Add(component => component.Expanded, true)
            .Add(component => component.ChildContent, NavItemContent("/admin/users", "Users")));

        Assert.True(cut.Find("details").HasAttribute("open"));
        Assert.Equal("Administration", cut.Find("summary .nav-submenu__label").TextContent);
        Assert.NotNull(cut.Find(".nav-submenu__items .nav-item"));
    }

    private static RenderFragment NavItemContent(string href, string label) => builder =>
    {
        builder.OpenComponent<NavItem>(0);
        builder.AddAttribute(1, nameof(NavItem.Href), href);
        builder.AddAttribute(2, nameof(NavItem.IconRestName), "Table");
        builder.AddAttribute(3, nameof(NavItem.ChildContent), (RenderFragment)(contentBuilder => contentBuilder.AddContent(0, label)));
        builder.CloseComponent();
    };
}
