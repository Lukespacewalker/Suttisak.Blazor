using Bunit;
using Suttisak.Blazor.UserInterface.Components.Common;

namespace Suttisak.Blazor.UserInterface.Tests;

public class SearchPickerTests
{
    static readonly IReadOnlyList<AppSelectOption<string>> Options = [new("a", "Alpha"), new("b", "Beta"), new("c", "Unavailable", true)];

    [Fact]
    public void SelectGuardRejectsBeforeChangingBoundValue()
    {
        using var context = new BunitContext();
        string? changed = null;
        var cut = context.Render<AppSelect<string>>(p => p.Add(c => c.Label, "Guarded choice").Add(c => c.Value, "a").Add(c => c.Options, Options).Add(c => c.SelectionGuard, value => value != "b").Add(c => c.ValueChanged, value => changed = value));
        cut.Find("select").Change("b");
        Assert.Null(changed);
        Assert.Equal("a", cut.Find("select").GetAttribute("value"));
        cut.Find("select").Change("c");
        Assert.Equal("c", changed);
    }

    [Fact]
    public void RejectedParentSelectionKeepsDisplayedValueAndQuery()
    {
        using var context = new BunitContext();
        IReadOnlyList<string>? proposed = null;
        var cut = context.Render<AppSearchPicker<string>>(p => p.Add(c => c.Label, "Item").Add(c => c.Options, Options).Add(c => c.SelectedValues, new[] { "a" }).Add(c => c.SelectedValuesChanged, values => proposed = values));
        var search = cut.Find("input");
        search.Input("Beta");
        var beta = cut.Find("button[data-picker-option='b']");
        beta.Click();
        Assert.Equal(new[] { "b" }, proposed);
        Assert.Equal("false", beta.GetAttribute("aria-pressed"));
        Assert.Equal("Beta", cut.Find("input").GetAttribute("value"));
        Assert.Contains("Alpha", cut.Find(".app-search-picker__selected").TextContent);
    }

    [Fact]
    public void MultipleSelectionRemovalExternalValuesAndSearchCallbacksAreTyped()
    {
        using var context = new BunitContext();
        IReadOnlyList<string>? proposed = null;
        string query = "";
        var cut = context.Render<AppSearchPicker<string>>(p => p.Add(c => c.Label, "Items").Add(c => c.Options, Options).Add(c => c.Multiple, true).Add(c => c.SelectedValues, new[] { "a" }).Add(c => c.SelectedValuesChanged, values => proposed = values).Add(c => c.QueryChanged, value => query = value));
        cut.Find("button[data-picker-option='b']").Click();
        Assert.Equal(new[] { "a", "b" }, proposed);
        cut.Render(p => p.Add(c => c.SelectedValues, new[] { "a", "b" }));
        cut.Find("button[data-picker-remove='a']").Click();
        Assert.Equal(new[] { "b" }, proposed);
        cut.Find("input").Input("Beta");
        Assert.Equal("Beta", query);
        cut.Render(p => p.Add(c => c.SelectedValues, new[] { "b" }));
        Assert.DoesNotContain("Alpha", cut.Find(".app-search-picker__selected").TextContent);
    }

    [Fact]
    public void DisabledLoadingAndEmptyStatesAreLabelled()
    {
        using var context = new BunitContext();
        var cut = context.Render<AppSearchPicker<string>>(p => p.Add(c => c.Label, "Item").Add(c => c.Options, Options).Add(c => c.Disabled, true));
        Assert.All(cut.FindAll("button"), b => Assert.True(b.HasAttribute("disabled")));
        cut.Render(p => p.Add(c => c.Loading, true));
        Assert.Contains("Loading", cut.Find("[role='status']").TextContent);
        cut.Render(p => p.Add(c => c.Loading, false).Add(c => c.Options, Array.Empty<AppSelectOption<string>>()));
        Assert.Contains("No matching", cut.Find("[role='status']").TextContent);
    }
}
