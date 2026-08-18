namespace Suttisak.Blazor.UserInterface.Components.Common;

/// <summary>Controls whether grid rows can be selected.</summary>
public enum AppGridSelectionMode
{
    None,
    Single,
    Multiple
}

/// <summary>Describes the active sort so an asynchronous source can apply it at the data store.</summary>
public sealed record AppGridSort(string ColumnId, bool Descending);

/// <summary>Request sent to an asynchronous grid data source.</summary>
public sealed record AppGridItemsProviderRequest<TGridItem>(
    int StartIndex,
    int? Count,
    AppGridSort? Sort,
    CancellationToken CancellationToken);

/// <summary>Page of data returned by an asynchronous grid data source.</summary>
public sealed record AppGridItemsProviderResult<TGridItem>(
    IReadOnlyCollection<TGridItem> Items,
    int TotalItemCount)
{
    public static AppGridItemsProviderResult<TGridItem> From(IEnumerable<TGridItem> items, int totalItemCount)
        => new(items as IReadOnlyCollection<TGridItem> ?? items.ToArray(), totalItemCount);
}

/// <summary>Asynchronously supplies a page of grid data.</summary>
public delegate ValueTask<AppGridItemsProviderResult<TGridItem>> AppGridItemsProvider<TGridItem>(
    AppGridItemsProviderRequest<TGridItem> request);

/// <summary>
/// Mutable paging state shared by <see cref="AppGrid{TGridItem}"/> and
/// <see cref="AppGridPaginator"/>. A single state instance may be retained by a page.
/// </summary>
public sealed class AppGridPaginationState
{
    private int _currentPageIndex;
    private int _itemsPerPage;

    public AppGridPaginationState(int itemsPerPage = 25)
    {
        if (itemsPerPage <= 0)
            throw new ArgumentOutOfRangeException(nameof(itemsPerPage), "Items per page must be greater than zero.");
        _itemsPerPage = itemsPerPage;
    }

    public int CurrentPageIndex => _currentPageIndex;
    public int ItemsPerPage => _itemsPerPage;
    public int? TotalItemCount { get; private set; }
    public int? LastPageIndex => TotalItemCount is null ? null : Math.Max(0, (TotalItemCount.Value - 1) / ItemsPerPage);

    /// <summary>Raised whenever display information changes.</summary>
    public event Action? StateChanged;

    /// <summary>Raised only after navigation, so consumers can load the new page.</summary>
    public event Action? PageChanged;

    public Task SetCurrentPageIndexAsync(int pageIndex)
    {
        var lastPageIndex = LastPageIndex;
        var normalized = Math.Max(0, pageIndex);
        if (lastPageIndex is not null)
            normalized = Math.Min(normalized, lastPageIndex.Value);

        if (_currentPageIndex == normalized)
            return Task.CompletedTask;

        _currentPageIndex = normalized;
        StateChanged?.Invoke();
        PageChanged?.Invoke();
        return Task.CompletedTask;
    }

    public Task SetItemsPerPageAsync(int itemsPerPage)
    {
        if (itemsPerPage <= 0)
            throw new ArgumentOutOfRangeException(nameof(itemsPerPage), "Items per page must be greater than zero.");

        if (_itemsPerPage == itemsPerPage)
            return Task.CompletedTask;

        _itemsPerPage = itemsPerPage;
        _currentPageIndex = 0;
        StateChanged?.Invoke();
        PageChanged?.Invoke();
        return Task.CompletedTask;
    }

    internal bool SetTotalItemCount(int totalItemCount)
    {
        TotalItemCount = Math.Max(0, totalItemCount);
        var lastPageIndex = LastPageIndex ?? 0;
        var pageWasClamped = _currentPageIndex > lastPageIndex;
        if (_currentPageIndex > lastPageIndex)
            _currentPageIndex = lastPageIndex;
        StateChanged?.Invoke();
        return pageWasClamped;
    }
}
