using Bunit;
using Microsoft.AspNetCore.Components;
using Suttisak.Blazor.UserInterface.Components.Common;

namespace Suttisak.Blazor.UserInterface.Tests;

public sealed class ReusableGridActionsTests
{
    [Fact]
    public void Clear_selection_reaches_the_consumer_and_is_blocked_while_busy()
    {
        using var context = new BunitContext();
        var calls = 0;
        var cut = context.Render<AppGridSelectionToolbar>(parameters => parameters
            .Add(component => component.SelectedCount, 2)
            .Add(component => component.SelectedLabel, "รายการที่เลือก")
            .Add(component => component.ClearLabel, "ล้างการเลือก")
            .Add(component => component.OnClear, () => calls++)
            .Add(component => component.Actions, builder => builder.AddMarkupContent(0, "<button>Export</button>")));
        Assert.Equal("2 รายการที่เลือก", cut.Find("[role=status]").TextContent.Trim());
        cut.Find("button[aria-label='ล้างการเลือก']").Click();
        Assert.Equal(1, calls);
        cut.Render(parameters => parameters.Add(component => component.Busy, true));
        Assert.True(cut.Find("fieldset").HasAttribute("disabled"));
        cut.Find("button[aria-label='ล้างการเลือก']").Click();
        Assert.Equal(1, calls);
    }

    [Fact]
    public void Menu_renders_independent_targets_and_application_owned_callbacks()
    {
        using var context = new BunitContext();
        var calls = 0;
        RenderFragment action = builder =>
        {
            builder.OpenComponent<AppButton>(0);
            builder.AddAttribute(1, nameof(AppButton.OnClick), EventCallback.Factory.Create<Microsoft.AspNetCore.Components.Web.MouseEventArgs>(this, () => calls++));
            builder.AddAttribute(2, nameof(AppButton.ChildContent), (RenderFragment)(content => content.AddContent(0, "Edit")));
            builder.CloseComponent();
        };
        var first = context.Render<AppActionMenu>(parameters => parameters
            .Add(component => component.AriaLabel, "Actions for first record")
            .Add(component => component.ChildContent, action));
        var second = context.Render<AppActionMenu>(parameters => parameters
            .Add(component => component.AriaLabel, "Actions for second record")
            .Add(component => component.ChildContent, action));
        Assert.NotEqual(first.Find("[popover]").Id, second.Find("[popover]").Id);
        Assert.Equal(first.Find("[popover]").Id, first.Find("button[popovertarget]").GetAttribute("popovertarget"));
        first.Find("[popover] button").Click();
        Assert.Equal(1, calls);
        second.Render(parameters => parameters.Add(component => component.Disabled, true));
        Assert.True(second.Find("button[popovertarget]").HasAttribute("disabled"));
    }
}
