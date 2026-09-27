using System.Linq.Expressions;
using Bunit;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.QuickGrid;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.JSInterop;
using Suttisak.Blazor.UserInterface.Components.Common;

namespace Suttisak.Blazor.UserInterface.Tests;

public sealed class AppGridCompactTests
{
    [Theory]
    [InlineData(false)]
    [InlineData(true)]
    public async Task Delayed_import_does_not_attach_after_cards_are_disabled_or_disposed(bool dispose)
    {
        using var context = new BunitContext();
        var runtime = new DelayedGridRuntime();
        context.Services.AddSingleton<IJSRuntime>(runtime);
        var cut = context.Render<AppGrid<Row>>(p => p.Add(x => x.Items, Rows)
            .Add(x => x.ChildContent, Columns).Add(x => x.CardTemplate, Card)
            .Add(x => x.CompactLayout, AppGridCompactLayout.Cards)
            .Add(x => x.Pagination, new PaginationState()));
        cut.WaitForAssertion(() => Assert.True(runtime.ImportRequested));
        Task? disposing = null;
        if (dispose) disposing = cut.Instance.DisposeAsync().AsTask();
        else cut.Render(p => p.Add(x => x.CompactLayout, AppGridCompactLayout.Table));
        await cut.InvokeAsync(() => runtime.Import.SetResult(runtime.Module));
        if (disposing is not null) await disposing;
        else cut.WaitForAssertion(() => Assert.Contains("disconnect", runtime.Module.Calls));
        Assert.DoesNotContain("observe", runtime.Module.Calls);
        if (dispose) Assert.True(runtime.Module.Disposed);
    }

    [Fact]
    public async Task Pending_sort_uses_latest_column_and_direction()
    {
        using var context = new BunitContext();
        context.JSInterop.Mode = JSRuntimeMode.Loose;
        var pending = new List<(GridItemsProviderRequest<Row> Request, TaskCompletionSource<GridItemsProviderResult<Row>> Completion)>();
        var delay = false;
        GridItemsProvider<Row> provider = request =>
        {
            if (!delay) return ValueTask.FromResult(GridItemsProviderResult.From(Rows.ToArray(), 3));
            var completion = new TaskCompletionSource<GridItemsProviderResult<Row>>(TaskCreationOptions.RunContinuationsAsynchronously);
            pending.Add((request, completion));
            return new(completion.Task);
        };
        var cut = context.Render<AppGrid<Row>>(p => p.Add(x => x.ItemsProvider, provider)
            .Add(x => x.ChildContent, TwoColumns).Add(x => x.CardTemplate, Card)
            .Add(x => x.CompactLayout, AppGridCompactLayout.Cards)
            .Add(x => x.Pagination, new PaginationState { ItemsPerPage = 3 }));
        delay = true;
        var columnChange = cut.Find(".app-grid__sort-column").ChangeAsync(new ChangeEventArgs { Value = "0" });
        cut.WaitForAssertion(() => Assert.Single(pending));
        Assert.False(cut.Find(".app-grid__sort-direction").HasAttribute("disabled"));
        var directionChange = cut.Find(".app-grid__sort-direction").ChangeAsync(new ChangeEventArgs { Value = "descending" });
        cut.WaitForAssertion(() => Assert.Equal(2, pending.Count));
        var secondColumnChange = cut.Find(".app-grid__sort-column").ChangeAsync(new ChangeEventArgs { Value = "1" });
        cut.WaitForAssertion(() => Assert.Equal(3, pending.Count));
        Assert.Equal("ID", pending[2].Request.SortByColumn!.Title);
        Assert.False(pending[2].Request.SortByAscending);
        await cut.InvokeAsync(() =>
        {
            foreach (var entry in pending)
                entry.Completion.SetResult(GridItemsProviderResult.From(entry.Request.ApplySorting(Rows).ToArray(), 3));
        });
        await Task.WhenAll(columnChange, directionChange, secondColumnChange);
        cut.WaitForAssertion(() => Assert.Contains("Alpha", cut.Find(".app-grid__card").TextContent));
    }

    [Fact]
    public void Cards_require_template_pagination_and_nonvirtual_rows()
    {
        using var context = new BunitContext();
        context.JSInterop.Mode = JSRuntimeMode.Loose;
        Assert.Throws<InvalidOperationException>(() => context.Render<AppGrid<Row>>(p => p
            .Add(x => x.Items, Rows).Add(x => x.ChildContent, Columns)
            .Add(x => x.CompactLayout, AppGridCompactLayout.Cards)));
        Assert.Throws<InvalidOperationException>(() => context.Render<AppGrid<Row>>(p => p
            .Add(x => x.Items, Rows).Add(x => x.ChildContent, Columns)
            .Add(x => x.CompactLayout, AppGridCompactLayout.Cards).Add(x => x.CardTemplate, Card)));
        Assert.Throws<InvalidOperationException>(() => context.Render<AppGrid<Row>>(p => p
            .Add(x => x.Items, Rows).Add(x => x.ChildContent, Columns)
            .Add(x => x.CompactLayout, AppGridCompactLayout.Cards).Add(x => x.CardTemplate, Card)
            .Add(x => x.Pagination, new PaginationState()).Add(x => x.Virtualize, true)));
    }

    [Fact]
    public async Task Cards_share_the_sorted_page_and_selection_with_table_without_a_second_provider()
    {
        using var context = new BunitContext();
        context.JSInterop.Mode = JSRuntimeMode.Loose;
        var pagination = new PaginationState { ItemsPerPage = 2 };
        var calls = 0;
        IReadOnlySet<Row> selected = new HashSet<Row>();
        GridItemsProvider<Row> provider = request =>
        {
            calls++;
            return ValueTask.FromResult(GridItemsProviderResult.From(
                request.ApplySorting(Rows).Skip(request.StartIndex).Take(request.Count ?? 3).ToArray(), 3));
        };
        // QuickGrid may fetch again when it first learns the total page count.
        // Compare with the same existing table path, rather than assuming its lifecycle.
        var table = context.Render<AppGrid<Row>>(p => p
            .Add(x => x.ItemsProvider, provider).Add(x => x.ChildContent, Columns)
            .Add(x => x.Pagination, new PaginationState { ItemsPerPage = 2 })
            .Add(x => x.ItemKey, row => row.Id).Add(x => x.SelectionMode, AppGridSelectionMode.Multiple));
        table.WaitForAssertion(() => Assert.Equal(2, table.FindAll("tbody tr.app-grid__data-row").Count));
        var initialTableCalls = calls;
        calls = 0;
        var cut = context.Render<AppGrid<Row>>(p => p
            .Add(x => x.ItemsProvider, provider).Add(x => x.ChildContent, Columns)
            .Add(x => x.Pagination, pagination).Add(x => x.ItemKey, row => row.Id)
            .Add(x => x.CompactLayout, AppGridCompactLayout.Cards).Add(x => x.CardTemplate, Card)
            .Add(x => x.SelectionMode, AppGridSelectionMode.Multiple)
            .Add(x => x.SelectedItemsChanged, value => selected = value));
        cut.WaitForAssertion(() => Assert.Equal(2, cut.FindAll(".app-grid__card").Count));
        Assert.Equal(initialTableCalls, calls);
        var initialCalls = calls;
        cut.Find(".app-grid__sort-column").Change("0");
        cut.WaitForAssertion(() => Assert.Contains("Alpha", cut.Find(".app-grid__card").TextContent));
        Assert.Equal(initialCalls + 1, calls);
        cut.Find(".app-grid__card input").Change(true);
        Assert.Equal(3, Assert.Single(selected).Id);
        Assert.True(cut.Find("tbody tr input").HasAttribute("checked"));
        cut.Find(".app-grid__sort-direction").Change("descending");
        cut.WaitForAssertion(() => Assert.Contains("Zulu", cut.Find(".app-grid__card").TextContent));
        await cut.InvokeAsync(() => pagination.SetCurrentPageIndexAsync(1));
        cut.WaitForAssertion(() => Assert.Single(cut.FindAll(".app-grid__card")));
        Assert.Contains("Alpha", cut.Find(".app-grid__card").TextContent);
        var before = calls;
        cut.Render(p => p.Add(x => x.CompactBreakpoint, 800));
        Assert.Equal(before, calls);
        Assert.True(cut.Find(".app-grid__card input").HasAttribute("checked"));
    }

    private sealed record Row(int Id, string Name);
    private sealed class DelayedGridRuntime : IJSRuntime
    {
        public TaskCompletionSource<IJSObjectReference> Import { get; } = new(TaskCreationOptions.RunContinuationsAsynchronously);
        public GridModule Module { get; } = new();
        public bool ImportRequested { get; private set; }
        public ValueTask<TValue> InvokeAsync<TValue>(string identifier, object?[]? args)
            => InvokeAsync<TValue>(identifier, default, args);
        public async ValueTask<TValue> InvokeAsync<TValue>(string identifier, CancellationToken cancellationToken, object?[]? args)
        {
            if (identifier == "import" && args?[0]?.ToString()?.EndsWith("/app-grid.js") == true)
            {
                ImportRequested = true;
                return (TValue)(object)await Import.Task;
            }
            return typeof(TValue) == typeof(IJSObjectReference) ? (TValue)(object)new GridModule() : default!;
        }
    }
    private sealed class GridModule : IJSObjectReference
    {
        public List<string> Calls { get; } = [];
        public bool Disposed { get; private set; }
        public ValueTask DisposeAsync() { Disposed = true; return ValueTask.CompletedTask; }
        public ValueTask<TValue> InvokeAsync<TValue>(string identifier, object?[]? args)
            => InvokeAsync<TValue>(identifier, default, args);
        public ValueTask<TValue> InvokeAsync<TValue>(string identifier, CancellationToken cancellationToken, object?[]? args)
        {
            Calls.Add(identifier);
            return ValueTask.FromResult(typeof(TValue) == typeof(IJSObjectReference) ? (TValue)(object)this : default!);
        }
    }
    private static IQueryable<Row> Rows => new[] { new Row(1, "Zulu"), new Row(2, "Bravo"), new Row(3, "Alpha") }.AsQueryable();
    private static RenderFragment<Row> Card => row => builder => builder.AddContent(0, row.Name);
    private static RenderFragment Columns => builder =>
    {
        builder.OpenComponent<AppGridPropertyColumn<Row, string>>(0);
        builder.AddAttribute(1, "Property", (Expression<Func<Row, string>>)(row => row.Name));
        builder.AddAttribute(2, "Title", "Name");
        builder.AddAttribute(3, "Sortable", true);
        builder.CloseComponent();
    };
    private static RenderFragment TwoColumns => builder =>
    {
        builder.AddContent(0, Columns);
        builder.OpenComponent<AppGridPropertyColumn<Row, int>>(1);
        builder.AddAttribute(2, "Property", (Expression<Func<Row, int>>)(row => row.Id));
        builder.AddAttribute(3, "Title", "ID");
        builder.AddAttribute(4, "Sortable", true);
        builder.CloseComponent();
    };
}
