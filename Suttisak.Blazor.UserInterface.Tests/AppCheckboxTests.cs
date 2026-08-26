using Bunit;
using Microsoft.AspNetCore.Components;
using Suttisak.Blazor.UserInterface.Components.Common;

namespace Suttisak.Blazor.UserInterface.Tests;

public sealed class AppCheckboxTests
{
    [Fact]
    public void Three_state_checkbox_cycles_checked_indeterminate_and_unchecked()
    {
        using var context = new BunitContext();
        context.JSInterop.Mode = JSRuntimeMode.Loose;
        bool? checkState = true;
        var changed = EventCallback.Factory.Create<bool?>(this, value => checkState = value);

        var checkbox = context.Render<AppCheckbox>(parameters => parameters
            .Add(component => component.ThreeState, true)
            .Add(component => component.CheckState, checkState)
            .Add(component => component.CheckStateChanged, changed));

        checkbox.Find("input[type=checkbox]").Click();
        Assert.Null(checkState);

        checkbox.Render(parameters => parameters
            .Add(component => component.ThreeState, true)
            .Add(component => component.CheckState, checkState)
            .Add(component => component.CheckStateChanged, changed));
        checkbox.Find("input[type=checkbox]").Click();
        Assert.False(checkState);

        checkbox.Render(parameters => parameters
            .Add(component => component.ThreeState, true)
            .Add(component => component.CheckState, checkState)
            .Add(component => component.CheckStateChanged, changed));
        checkbox.Find("input[type=checkbox]").Click();
        Assert.True(checkState);
    }

    [Fact]
    public void Hidden_indeterminate_state_behaves_as_a_two_state_control()
    {
        using var context = new BunitContext();
        context.JSInterop.Mode = JSRuntimeMode.Loose;
        bool? checkState = false;
        var changed = EventCallback.Factory.Create<bool?>(this, value => checkState = value);

        var checkbox = context.Render<AppCheckbox>(parameters => parameters
            .Add(component => component.ThreeState, true)
            .Add(component => component.ShowIndeterminate, false)
            .Add(component => component.ThreeStateOrderUncheckToIntermediate, true)
            .Add(component => component.CheckState, checkState)
            .Add(component => component.CheckStateChanged, changed));

        checkbox.Find("input[type=checkbox]").Change(true);
        Assert.True(checkState);

        checkbox.Render(parameters => parameters
            .Add(component => component.ThreeState, true)
            .Add(component => component.ShowIndeterminate, false)
            .Add(component => component.ThreeStateOrderUncheckToIntermediate, true)
            .Add(component => component.CheckState, checkState)
            .Add(component => component.CheckStateChanged, changed));
        checkbox.Find("input[type=checkbox]").Change(false);

        Assert.False(checkState);
    }
}
