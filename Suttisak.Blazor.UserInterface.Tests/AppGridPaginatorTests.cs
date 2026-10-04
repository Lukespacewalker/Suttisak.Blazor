using Bunit;
using Microsoft.AspNetCore.Components.QuickGrid;
using Suttisak.Blazor.UserInterface.Components.Common;

namespace Suttisak.Blazor.UserInterface.Tests;

public sealed class AppGridPaginatorTests
{
    [Fact]
    public void First_page_shows_range_and_a_bounded_number_window()
    {
        using var context = new BunitContext();
        var state = Populate(context, 1248);
        var cut = context.Render<AppGridPaginator>(p => p.Add(x => x.State, state));

        Assert.Equal("Showing 1–10 of 1,248 rows", cut.Find(".app-grid-paginator__summary").TextContent);
        Assert.Equal(new[] { "1", "2", "3", "4", "5", "125" }, Numbers(cut));
        Assert.Equal("page", cut.Find("button[aria-current]").GetAttribute("aria-current"));
        Assert.Single(cut.FindAll(".app-grid-paginator__ellipsis"));
    }

    [Theory]
    [InlineData(61, "1,60,61,62,63,64,125", "Showing 611–620 of 1,248 rows")]
    [InlineData(124, "1,121,122,123,124,125", "Showing 1,241–1,248 of 1,248 rows")]
    public async Task Middle_and_last_pages_keep_boundaries_and_current_neighbors(int index, string expected, string summary)
    {
        using var context = new BunitContext();
        var state = Populate(context, 1248);
        await context.Renderer.Dispatcher.InvokeAsync(() => state.SetCurrentPageIndexAsync(index));
        var cut = context.Render<AppGridPaginator>(p => p.Add(x => x.State, state));

        Assert.Equal(expected.Split(','), Numbers(cut));
        Assert.Equal(summary, cut.Find(".app-grid-paginator__summary").TextContent);
        Assert.Equal((index + 1).ToString(), cut.Find("button[aria-current]").TextContent.Trim());
    }

    [Fact]
    public void Numbered_button_moves_shared_state_and_emits_one_page_callback()
    {
        using var context = new BunitContext();
        var state = Populate(context, 1248);
        var changed = new List<int>();
        var cut = context.Render<AppGridPaginator>(p => p
            .Add(x => x.State, state)
            .Add(x => x.CurrentPageIndexChanged, index => changed.Add(index)));

        cut.Find("button[aria-label='Page 5']").Click();

        Assert.Equal(4, state.CurrentPageIndex);
        Assert.Equal(new[] { 4 }, changed);
        Assert.Equal("5", cut.Find("button[aria-current]").TextContent.Trim());
    }

    [Fact]
    public void Empty_and_loading_states_do_not_offer_phantom_pages()
    {
        using var context = new BunitContext();
        var empty = context.Render<AppGridPaginator>(p => p.Add(x => x.State, Populate(context, 0)));
        Assert.Equal("Showing 0–0 of 0 rows", empty.Find(".app-grid-paginator__summary").TextContent);
        Assert.Empty(empty.FindAll(".app-grid-paginator__number"));
        Assert.All(empty.FindAll("button"), button => Assert.True(button.HasAttribute("disabled")));

        var loading = context.Render<AppGridPaginator>(p => p.Add(x => x.State, new PaginationState()));
        Assert.Equal("Rows are loading", loading.Find(".app-grid-paginator__summary").TextContent);
        Assert.Empty(loading.FindAll(".app-grid-paginator__number"));
        Assert.All(loading.FindAll("button"), button => Assert.True(button.HasAttribute("disabled")));
    }

    [Fact]
    public async Task Page_size_change_resets_page_and_emits_each_callback_once_with_coherent_state()
    {
        using var context = new BunitContext();
        var state = Populate(context, 1248);
        await context.Renderer.Dispatcher.InvokeAsync(() => state.SetCurrentPageIndexAsync(124));
        var observed = new List<string>();
        var cut = context.Render<AppGridPaginator>(p => p
            .Add(x => x.State, state)
            .Add(x => x.ItemsPerPageChanged, size => observed.Add($"size:{size},page:{state.CurrentPageIndex}"))
            .Add(x => x.CurrentPageIndexChanged, index => observed.Add($"page:{index},size:{state.ItemsPerPage}")));

        cut.Find("select").Change("50");

        Assert.Equal(0, state.CurrentPageIndex);
        Assert.Equal(50, state.ItemsPerPage);
        Assert.Equal(new[] { "size:50,page:0", "page:0,size:50" }, observed);
        Assert.Equal("Showing 1–50 of 1,248 rows", cut.Find(".app-grid-paginator__summary").TextContent);
        cut.Find("select").Change("50");
        cut.Find("select").Change("0");
        cut.Find("select").Change("999");
        Assert.Equal(2, observed.Count);
        Assert.Equal(50, state.ItemsPerPage);
    }

    [Fact]
    public void Custom_page_size_is_retained_and_options_are_positive_unique_and_ordered()
    {
        using var context = new BunitContext();
        var state = Populate(context, 1248);
        state.ItemsPerPage = 7;
        var cut = context.Render<AppGridPaginator>(p => p.Add(x => x.State, state)
            .Add(x => x.PageSizeOptions, new[] { 25, 0, -1, 10, 25 }));

        Assert.Equal(new[] { "7", "10", "25" }, cut.FindAll("option").Select(option => option.GetAttribute("value")));
        Assert.Equal("7", cut.Find("select").GetAttribute("value"));
    }

    [Fact]
    public void Custom_summary_and_opt_in_legacy_input_preserve_localized_labels_and_clamping()
    {
        using var context = new BunitContext();
        var state = Populate(context, 24);
        var cut = context.Render<AppGridPaginator>(p => p.Add(x => x.State, state)
            .Add(x => x.ShowPageInput, true).Add(x => x.ShowPageNumbers, false)
            .Add(x => x.ShowPageSizeSelector, false).Add(x => x.PageLabel, "หน้า")
            .Add(x => x.NumberFieldStyle, "width: 6rem")
            .Add(x => x.SummaryTemplate, "Application-owned result context"));

        Assert.Equal("Application-owned result context", cut.Find(".app-grid-paginator__summary").TextContent);
        Assert.Empty(cut.FindAll("select, .app-grid-paginator__number"));
        Assert.Contains("หน้า", cut.Find("label").TextContent);
        Assert.Equal("width: 6rem", cut.Find("input").GetAttribute("style"));
        cut.Find("input").Change("99");
        Assert.Equal(2, state.CurrentPageIndex);
        cut.Find("input").Change("-4");
        Assert.Equal(0, state.CurrentPageIndex);
    }

    private static PaginationState Populate(BunitContext context, int count)
    {
        context.JSInterop.Mode = JSRuntimeMode.Loose;
        var state = new PaginationState { ItemsPerPage = 10 };
        context.Render<GridPerformanceHarness>(p => p
            .Add(x => x.Items, Enumerable.Range(1, count).Select(id => new GridPerformanceHarness.GridRow(id)).AsQueryable())
            .Add(x => x.Pagination, state));
        return state;
    }

    private static string[] Numbers(IRenderedComponent<AppGridPaginator> cut) =>
        cut.FindAll(".app-grid-paginator__number").Select(button => button.TextContent.Trim()).ToArray();
}
