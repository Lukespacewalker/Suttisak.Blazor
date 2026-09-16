using System.Linq.Expressions;
using Bunit;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.QuickGrid;
using Suttisak.Blazor.UserInterface.Components.Common;

namespace Suttisak.Blazor.UserInterface.Tests;

public sealed class AppGridActionPlacementTests
{
    [Fact]
    public async Task Select_all_targets_the_sorted_page_and_preserves_other_pages()
    {
        using var context = new BunitContext();
        context.JSInterop.Mode = JSRuntimeMode.Loose;
        var rows = new[] { new GridRow(1, "Zulu"), new GridRow(2, "Bravo"), new GridRow(3, "Alpha") };
        var pagination = new PaginationState { ItemsPerPage = 2 };
        IReadOnlySet<GridRow> selected = new HashSet<GridRow>();
        var cut = context.Render<AppGrid<GridRow>>(parameters => parameters
            .Add(component => component.Items, rows.AsQueryable())
            .Add(component => component.ItemKey, row => row.Id)
            .Add(component => component.Pagination, pagination)
            .Add(component => component.SelectionMode, AppGridSelectionMode.Multiple)
            .Add(component => component.SelectedItemsChanged, value => selected = value)
            .Add(component => component.ChildContent, GridColumns()));

        cut.Find("button.col-title").Click();
        cut.WaitForAssertion(() => Assert.Contains("Alpha", cut.Find("tbody tr").TextContent));
        cut.Find("thead input[type=checkbox]").Change(true);
        Assert.Equal(new[] { 2, 3 }, selected.Select(row => row.Id).Order().ToArray());
        Assert.All(cut.FindAll("tbody tr"), row => Assert.Contains("is-selected", row.ClassList));

        await cut.InvokeAsync(() => pagination.SetCurrentPageIndexAsync(1));
        cut.WaitForAssertion(() => Assert.Contains("Zulu", cut.Find("tbody tr").TextContent));
        cut.Find("thead input[type=checkbox]").Change(true);
        Assert.Equal(3, selected.Count);
        cut.Find("thead input[type=checkbox]").Change(false);
        Assert.Equal(new[] { 2, 3 }, selected.Select(row => row.Id).Order().ToArray());
    }

    [Theory]
    [InlineData("AppActionMenu")]
    [InlineData("AppGridSelectionToolbar")]
    public void Grid_actions_can_be_resolved_from_the_reusable_library(string name)
    {
        var component = typeof(AppGrid<>).Assembly.GetType($"Suttisak.Blazor.UserInterface.Components.Common.{name}");
        Assert.NotNull(component);
        Assert.True(typeof(IComponent).IsAssignableFrom(component));
    }

    [Fact]
    public void Single_selection_has_row_checkboxes_without_a_select_all_control()
    {
        using var context = new BunitContext();
        context.JSInterop.Mode = JSRuntimeMode.Loose;
        var rows = new[] { new GridRow(1, "Alpha"), new GridRow(2, "Beta") };

        var cut = context.Render<AppGrid<GridRow>>(parameters => parameters
            .Add(component => component.Items, rows.AsQueryable())
            .Add(component => component.ItemKey, row => row.Id)
            .Add(component => component.SelectionMode, AppGridSelectionMode.Single)
            .Add(component => component.ChildContent, GridColumns()));

        cut.WaitForAssertion(() => Assert.Equal(2, cut.FindAll("tbody tr").Count));
        Assert.Empty(cut.FindAll("thead input[type=checkbox]"));
        Assert.Equal(2, cut.FindAll("tbody input[type=checkbox]").Count);
    }

    [Fact]
    public void Multiple_selection_exposes_select_all()
    {
        using var context = new BunitContext();
        context.JSInterop.Mode = JSRuntimeMode.Loose;
        var rows = new[] { new GridRow(1, "Alpha"), new GridRow(2, "Beta") };

        var cut = context.Render<AppGrid<GridRow>>(parameters => parameters
            .Add(component => component.Items, rows.AsQueryable())
            .Add(component => component.ItemKey, row => row.Id)
            .Add(component => component.SelectionMode, AppGridSelectionMode.Multiple)
            .Add(component => component.ChildContent, GridColumns()));

        cut.WaitForAssertion(() => Assert.Equal(2, cut.FindAll("tbody tr").Count));
        var selectAll = Assert.Single(cut.FindAll("thead input[type=checkbox]"));
        Assert.Equal("Select all visible rows", selectAll.GetAttribute("aria-label"));
    }

    [Fact]
    public void Selection_toolbar_replaces_the_regular_toolbar_when_selection_is_active()
    {
        using var context = new BunitContext();

        var cut = context.Render<AppGridShell>(parameters => parameters
            .Add(component => component.SelectionActive, false)
            .Add(component => component.Toolbar, TextFragment("Regular toolbar"))
            .Add(component => component.SelectionToolbar, ToolbarFragment("Selection toolbar"))
            .Add(component => component.ChildContent, TextFragment("Grid body")));

        Assert.Contains("Regular toolbar", cut.Markup, StringComparison.Ordinal);
        Assert.DoesNotContain("Selection toolbar", cut.Markup, StringComparison.Ordinal);

        cut.Render(parameters => parameters
            .Add(component => component.SelectionActive, true)
            .Add(component => component.Toolbar, TextFragment("Regular toolbar"))
            .Add(component => component.SelectionToolbar, ToolbarFragment("Selection toolbar"))
            .Add(component => component.ChildContent, TextFragment("Grid body")));

        Assert.DoesNotContain("Regular toolbar", cut.Markup, StringComparison.Ordinal);
        Assert.Contains("Selection toolbar", cut.Markup, StringComparison.Ordinal);
        Assert.Equal("toolbar", cut.Find("[role=toolbar]").GetAttribute("role"));
    }

    private static RenderFragment GridColumns() => builder =>
    {
        builder.OpenComponent<AppGridPropertyColumn<GridRow, string>>(0);
        builder.AddAttribute(1, nameof(AppGridPropertyColumn<GridRow, string>.Property), (Expression<Func<GridRow, string>>)(row => row.Name));
        builder.AddAttribute(2, nameof(AppGridPropertyColumn<GridRow, string>.Title), "Name");
        builder.AddAttribute(3, nameof(AppGridPropertyColumn<GridRow, string>.Sortable), true);
        builder.CloseComponent();
    };

    private static RenderFragment TextFragment(string text) => builder => builder.AddContent(0, text);

    private static RenderFragment ToolbarFragment(string text) => builder =>
    {
        builder.OpenElement(0, "div");
        builder.AddAttribute(1, "role", "toolbar");
        builder.AddContent(2, text);
        builder.CloseElement();
    };

    private sealed record GridRow(int Id, string Name);
}
