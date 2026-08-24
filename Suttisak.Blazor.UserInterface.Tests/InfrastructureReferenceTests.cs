using Bunit;
using Microsoft.AspNetCore.Components;
using Suttisak.Blazor.UserInterface.Components.Common;
using Suttisak.Blazor.UserInterface.Components.Navigation;

namespace Suttisak.Blazor.UserInterface.Tests;

public sealed class InfrastructureReferenceTests
{
    [Fact]
    public void App_input_support_is_exercised_through_the_owning_input_relationship()
    {
        using var context = new BunitContext();
        var cut = context.Render<AppTextBox>(parameters => parameters
            .Add(component => component.Label, "Full name")
            .Add(component => component.Description, "Use the name shown on the identity record."));

        var input = cut.Find("input");
        var description = cut.Find("small.app-form-control__description");

        Assert.Equal(description.Id, input.GetAttribute("aria-describedby"));
        Assert.Equal("Use the name shown on the identity record.", description.TextContent);
    }

    [Fact]
    public void Mobile_menu_wrapper_translates_cascading_state_into_button_semantics()
    {
        using var context = new BunitContext();
        var state = new NavComponentState();
        var cut = context.Render<CascadingValue<NavComponentState>>(parameters => parameters
            .Add(component => component.Value, state)
            .Add(component => component.ChildContent, builder =>
            {
                builder.OpenComponent<LayoutMobileMenuButtonWrapper>(0);
                builder.CloseComponent();
            }));

        var button = cut.Find("button");
        Assert.Equal("false", button.GetAttribute("aria-expanded"));
        Assert.Equal("Open navigation menu", button.GetAttribute("aria-label"));

        button.Click();

        cut.WaitForAssertion(() =>
        {
            var updated = cut.Find("button");
            Assert.True(state.IsMobileOpen);
            Assert.Equal("true", updated.GetAttribute("aria-expanded"));
            Assert.Equal("Close navigation menu", updated.GetAttribute("aria-label"));
        });
    }
}
