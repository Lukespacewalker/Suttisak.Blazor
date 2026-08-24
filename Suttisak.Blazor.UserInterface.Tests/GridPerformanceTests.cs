using System.Collections;
using System.Linq.Expressions;
using Bunit;
using Microsoft.AspNetCore.Components.QuickGrid;
using Suttisak.Blazor.UserInterface.Components.Common;
using Xunit;

namespace Suttisak.Blazor.UserInterface.Tests;

public sealed class GridPerformanceTests
{
    [Fact]
    public void AppGrid_SortsAndPaginatesLargeQueryableWithoutEnumeratingEveryRow()
    {
        using var context = new BunitContext();
        context.JSInterop.Mode = JSRuntimeMode.Loose;
        var source = new TrackingQueryable<GridPerformanceHarness.GridRow>(
            Enumerable.Range(1, 100_000).Select(id => new GridPerformanceHarness.GridRow(id)));
        var pagination = new PaginationState { ItemsPerPage = 25 };

        var cut = context.Render<GridPerformanceHarness>(parameters => parameters
            .Add(parameter => parameter.Items, source)
            .Add(parameter => parameter.Pagination, pagination));

        var renderedRows = cut.FindAll("tbody tr:not(.app-grid__empty-row)");
        Assert.Equal(25, renderedRows.Count);
        Assert.Equal(100_000, pagination.TotalItemCount);
        // Column registration can cause one initial refresh in addition to
        // the first parameter load; both paths remain page-bounded.
        Assert.InRange(source.RowsYielded, 25, 50);
    }

    [Fact]
    public void AppGrid_RejectsInvalidVirtualizationSettings()
    {
        using var context = new BunitContext();
        context.JSInterop.Mode = JSRuntimeMode.Loose;
        var rows = Enumerable.Range(1, 100_000)
            .Select(id => new GridPerformanceHarness.GridRow(id))
            .AsQueryable();

        var exception = Assert.Throws<InvalidOperationException>(() => context.Render<AppGrid<GridPerformanceHarness.GridRow>>(
            parameters => parameters
                .Add(parameter => parameter.Items, rows)
                .Add(parameter => parameter.Virtualize, true)
                .Add(parameter => parameter.ItemSize, float.NaN)));

        Assert.Contains("ItemSize", exception.Message, StringComparison.Ordinal);
    }

    private sealed class TrackingCounter
    {
        public int RowsYielded { get; set; }
    }

    private sealed class TrackingQueryable<T> : IOrderedQueryable<T>
    {
        private readonly IQueryable<T> _inner;
        private readonly TrackingQueryProvider _provider;
        private readonly TrackingCounter _counter;

        public TrackingQueryable(IEnumerable<T> source)
        {
            _inner = source.AsQueryable();
            _counter = new TrackingCounter();
            _provider = new TrackingQueryProvider(_inner.Provider, _counter);
        }

        private TrackingQueryable(IQueryable<T> inner, TrackingCounter counter)
        {
            _inner = inner;
            _counter = counter;
            _provider = new TrackingQueryProvider(_inner.Provider, _counter);
        }

        public int RowsYielded => _counter.RowsYielded;
        public Type ElementType => typeof(T);
        public Expression Expression => _inner.Expression;
        public IQueryProvider Provider => _provider;

        public IEnumerator<T> GetEnumerator()
        {
            foreach (var row in _inner)
            {
                _counter.RowsYielded++;
                yield return row;
            }
        }

        IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();

        private sealed class TrackingQueryProvider : IQueryProvider
        {
            private readonly IQueryProvider _inner;
            private readonly TrackingCounter _counter;

            public TrackingQueryProvider(IQueryProvider inner, TrackingCounter counter)
            {
                _inner = inner;
                _counter = counter;
            }

            public IQueryable CreateQuery(Expression expression)
                => _inner.CreateQuery(expression);

            public IQueryable<TElement> CreateQuery<TElement>(Expression expression)
                => new TrackingQueryable<TElement>(_inner.CreateQuery<TElement>(expression), _counter);

            public object? Execute(Expression expression) => _inner.Execute(expression);
            public TResult Execute<TResult>(Expression expression) => _inner.Execute<TResult>(expression);
        }

    }
}
