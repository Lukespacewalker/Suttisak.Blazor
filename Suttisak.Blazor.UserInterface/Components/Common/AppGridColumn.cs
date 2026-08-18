using Microsoft.AspNetCore.Components;

namespace Suttisak.Blazor.UserInterface.Components.Common;

/// <summary>Base class for columns declared inside <see cref="AppGrid{TGridItem}"/>.</summary>
public abstract class AppGridColumn<TGridItem> : ComponentBase, IDisposable
{
    [CascadingParameter] private AppGrid<TGridItem>? Grid { get; set; }

    [Parameter] public string? Title { get; set; }
    [Parameter] public string? Width { get; set; }
    [Parameter] public string? Class { get; set; }
    [Parameter] public string? HeaderClass { get; set; }
    [Parameter] public bool Sortable { get; set; }
    [Parameter] public bool IsDefaultSortColumn { get; set; }
    [Parameter] public bool InitialSortDescending { get; set; }
    [Parameter] public string? AriaLabel { get; set; }

    internal virtual bool IsSelectionColumn => false;
    internal virtual string ColumnId => Title ?? GetType().Name;
    internal abstract RenderFragment<TGridItem> CellTemplate { get; }
    internal virtual object? GetSortValue(TGridItem item) => null;
    internal virtual bool SupportsQuerySort => false;
    /// <summary>
    /// Applies this column's sort to an <see cref="IQueryable{T}"/> when the
    /// column has a provider-translatable expression. Columns backed by a
    /// delegate keep the client-side fallback in <see cref="AppGrid{TGridItem}"/>.
    /// </summary>
    internal virtual IQueryable<TGridItem> ApplyQuerySort(IQueryable<TGridItem> source, bool descending) => source;
    internal virtual string HeaderText => Title ?? string.Empty;

    protected override void OnParametersSet()
    {
        if (Grid is null)
            throw new InvalidOperationException($"{GetType().Name} must be declared directly inside {nameof(AppGrid<TGridItem>)}.");

        Grid.RegisterColumn(this);
    }

    public void Dispose() => Grid?.UnregisterColumn(this);
}
