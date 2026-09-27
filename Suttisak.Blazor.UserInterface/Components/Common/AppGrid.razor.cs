using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.QuickGrid;
using Microsoft.JSInterop;

namespace Suttisak.Blazor.UserInterface.Components.Common;

public partial class AppGrid<TGridItem>
{
    /// <summary>Opt in to cards below CompactBreakpoint. Table preserves existing behavior.</summary>
    [Parameter] public AppGridCompactLayout CompactLayout { get; set; }
    /// <summary>Container width in CSS pixels below which cards are shown.</summary>
    [Parameter] public int CompactBreakpoint { get; set; } = 640;
    /// <summary>Application-owned card content. Required with Cards; must not duplicate selection controls.</summary>
    [Parameter] public RenderFragment<TGridItem>? CardTemplate { get; set; }
    [Parameter] public string SortLabel { get; set; } = "Sort by";
    [Parameter] public string SortDirectionLabel { get; set; } = "Sort direction";
    [Parameter] public string AscendingLabel { get; set; } = "Ascending";
    [Parameter] public string DescendingLabel { get; set; } = "Descending";

    private ElementReference _element;
    private IJSObjectReference? _compactModule;
    private Task<IJSObjectReference>? _compactModuleTask;
    private readonly List<AppGridColumn<TGridItem>> _columns = [];
    private ColumnBase<TGridItem>? _sortColumn;
    private bool _sortAscending = true;
    private bool _disposed;
    private IEnumerable<AppGridColumn<TGridItem>> SortableColumns => _columns.Where(column => column.SupportsSorting);
    private int SortColumnIndex => _sortColumn is AppGridColumn<TGridItem> column ? _columns.IndexOf(column) : -1;

    private void ValidateCompactLayout()
    {
        if (!Enum.IsDefined(CompactLayout)) throw new InvalidOperationException("Unknown CompactLayout.");
        if (CompactBreakpoint <= 0) throw new InvalidOperationException("CompactBreakpoint must be positive.");
        if (CompactLayout != AppGridCompactLayout.Cards) return;
        if (CardTemplate is null) throw new InvalidOperationException("Cards require CardTemplate.");
        if (Virtualize) throw new InvalidOperationException("Cards do not support Virtualize. Use Pagination instead.");
        if (Pagination is null) throw new InvalidOperationException("Cards require Pagination to bound the rendered items.");
    }

    internal void RegisterColumn(AppGridColumn<TGridItem> column)
    {
        if (_columns.Contains(column)) return;
        _columns.Add(column);
    }

    internal void UnregisterColumn(AppGridColumn<TGridItem> column)
    {
        _columns.Remove(column);
        if (!_disposed && CompactLayout == AppGridCompactLayout.Cards) _ = InvokeAsync(StateHasChanged);
    }

    private Task ChangeCardSortAsync(ChangeEventArgs args)
        => int.TryParse(args.Value?.ToString(), out var index) && index >= 0 && index < _columns.Count
            ? _grid!.SortByColumnAsync(_columns[index], _sortAscending ? SortDirection.Ascending : SortDirection.Descending)
            : Task.CompletedTask;

    private Task ChangeCardDirectionAsync(ChangeEventArgs args)
        => _sortColumn is null ? Task.CompletedTask
            : _grid!.SortByColumnAsync(_sortColumn, args.Value?.ToString() == "descending" ? SortDirection.Descending : SortDirection.Ascending);

    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        if (CompactLayout == AppGridCompactLayout.Cards)
        {
            var js = (IJSRuntime)Services.GetService(typeof(IJSRuntime))!;
            _compactModuleTask ??= js.InvokeAsync<IJSObjectReference>("import", "./_content/Suttisak.Blazor.UserInterface/js/app-grid.js").AsTask();
            _compactModule = await _compactModuleTask;
        }
        // Parameters and disposal may change while the module is downloading.
        if (_disposed || _compactModule is null) return;
        if (CompactLayout == AppGridCompactLayout.Cards)
            await _compactModule.InvokeVoidAsync("observe", _element, CompactBreakpoint);
        else
            await _compactModule.InvokeVoidAsync("disconnect", _element);
    }

    public async ValueTask DisposeAsync()
    {
        if (_disposed) return;
        _disposed = true;
        if (_compactModuleTask is null) return;
        try
        {
            _compactModule = await _compactModuleTask;
            await _compactModule.InvokeVoidAsync("disconnect", _element);
            await _compactModule.DisposeAsync();
        }
        catch (JSDisconnectedException) { }
    }
}
