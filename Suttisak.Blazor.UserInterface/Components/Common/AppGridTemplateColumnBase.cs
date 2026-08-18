using Microsoft.AspNetCore.Components;

namespace Suttisak.Blazor.UserInterface.Components.Common;

/// <summary>A column whose cells are supplied by application markup.</summary>
public abstract class AppGridTemplateColumnBase<TGridItem> : AppGridColumn<TGridItem>
{
    [Parameter, EditorRequired] public RenderFragment<TGridItem> ChildContent { get; set; } = default!;
    [Parameter] public Func<TGridItem, object?>? SortBy { get; set; }
    [Parameter] public string? SortKey { get; set; }

    internal override string ColumnId => SortKey ?? base.ColumnId;
    internal override RenderFragment<TGridItem> CellTemplate => ChildContent;
    internal override object? GetSortValue(TGridItem item) => SortBy?.Invoke(item);
}
