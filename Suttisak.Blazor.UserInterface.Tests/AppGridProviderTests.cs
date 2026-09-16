using System.Linq.Expressions;
using Bunit;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.QuickGrid;
using Microsoft.Extensions.DependencyInjection;
using Suttisak.Blazor.UserInterface.Components.Common;

namespace Suttisak.Blazor.UserInterface.Tests;

public sealed class AppGridProviderTests
{
    [Fact]
    public async Task Replacing_provider_cancels_old_window_and_selects_only_current_rows()
    {
        using var context = new BunitContext();
        context.JSInterop.Mode = JSRuntimeMode.Loose;
        var pending = new TaskCompletionSource<GridItemsProviderResult<Row>>(TaskCreationOptions.RunContinuationsAsynchronously);
        CancellationToken oldToken = default;
        IReadOnlySet<Row> selected = new HashSet<Row>();
        GridItemsProvider<Row> oldProvider = request => { oldToken = request.CancellationToken; return new(pending.Task); };
        GridItemsProvider<Row> currentProvider = request => ValueTask.FromResult(GridItemsProviderResult.From(new[] { new Row(9, "Current") }, 1));
        var cut = context.Render<AppGrid<Row>>(parameters => parameters
            .Add(component => component.ItemsProvider, oldProvider)
            .Add(component => component.ItemKey, row => row.Id)
            .Add(component => component.SelectionMode, AppGridSelectionMode.Multiple)
            .Add(component => component.SelectedItemsChanged, value => selected = value)
            .Add(component => component.ChildContent, Columns()));
        cut.Render(parameters => parameters.Add(component => component.ItemsProvider, currentProvider));
        cut.WaitForAssertion(() => Assert.Contains("Current", cut.Find("tbody").TextContent));
        Assert.True(oldToken.IsCancellationRequested);
        await cut.InvokeAsync(() => pending.SetResult(GridItemsProviderResult.From(new[] { new Row(1, "Obsolete") }, 1)));
        cut.Find("thead input[type=checkbox]").Change(true);
        cut.WaitForAssertion(() => Assert.Equal(9, Assert.Single(selected).Id));
        Assert.DoesNotContain("Obsolete", cut.Markup);
    }

    [Fact]
    public async Task Async_query_executor_materializes_the_sorted_page_for_selection()
    {
        using var context = new BunitContext();
        context.JSInterop.Mode = JSRuntimeMode.Loose;
        var executor = new QueryExecutor();
        context.Services.AddSingleton<IAsyncQueryExecutor>(executor);
        var pagination = new PaginationState { ItemsPerPage = 2 };
        IReadOnlySet<Row> selected = new HashSet<Row>();
        var cut = context.Render<AppGrid<Row>>(parameters => parameters
            .Add(component => component.Items, new[] { new Row(1, "Zulu"), new Row(2, "Bravo"), new Row(3, "Alpha") }.AsQueryable())
            .Add(component => component.Pagination, pagination)
            .Add(component => component.ItemKey, row => row.Id)
            .Add(component => component.SelectionMode, AppGridSelectionMode.Multiple)
            .Add(component => component.SelectedItemsChanged, value => selected = value)
            .Add(component => component.ChildContent, Columns()));
        cut.WaitForAssertion(() => Assert.Equal(3, pagination.TotalItemCount));
        cut.Find("button.col-title").Click();
        cut.WaitForAssertion(() => Assert.Contains("Alpha", cut.Find("tbody tr").TextContent));
        await cut.InvokeAsync(() => pagination.SetCurrentPageIndexAsync(1));
        cut.WaitForAssertion(() => Assert.Contains("Zulu", cut.Find("tbody tr").TextContent));
        cut.Find("thead input[type=checkbox]").Change(true);
        Assert.Equal(1, Assert.Single(selected).Id);
        Assert.NotEmpty(executor.WindowSizes);
        Assert.All(executor.WindowSizes, size => Assert.InRange(size, 1, 2));
        Assert.Equal(1, executor.WindowSizes.Last());
    }

    private static RenderFragment Columns() => builder =>
    {
        builder.OpenComponent<AppGridPropertyColumn<Row, string>>(0);
        builder.AddAttribute(1, "Property", (Expression<Func<Row, string>>)(row => row.Name));
        builder.AddAttribute(2, "Title", "Name");
        builder.AddAttribute(3, "Sortable", true);
        builder.CloseComponent();
    };

    private sealed record Row(int Id, string Name);

    private sealed class QueryExecutor : IAsyncQueryExecutor
    {
        public List<int> WindowSizes { get; } = [];
        public bool IsSupported<T>(IQueryable<T> queryable) => true;
        public async Task<int> CountAsync<T>(IQueryable<T> queryable) { await Task.Yield(); return queryable.Count(); }
        public async Task<T[]> ToArrayAsync<T>(IQueryable<T> queryable)
        {
            await Task.Yield();
            var result = queryable.ToArray();
            WindowSizes.Add(result.Length);
            return result;
        }
    }
}
