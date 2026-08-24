using System.Linq.Expressions;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.QuickGrid;
using Microsoft.AspNetCore.Components.Rendering;

namespace Suttisak.Blazor.UserInterface.Components.Common;

/// <summary>A QuickGrid column whose cells are supplied by application markup.</summary>
public abstract class AppGridTemplateColumnBase<TGridItem> : AppGridColumn<TGridItem>
{
    private static readonly RenderFragment<TGridItem> EmptyChildContent = _ => _ => { };

    [Parameter] public RenderFragment<TGridItem> ChildContent { get; set; } = EmptyChildContent;

    /// <summary>Convenience expression used to build QuickGrid sorting rules.</summary>
    [Parameter] public Expression<Func<TGridItem, object?>>? SortByExpression { get; set; }

    /// <summary>Retained as provider metadata for application-specific adapters.</summary>
    [Parameter] public string? SortKey { get; set; }

    [Parameter] public override GridSort<TGridItem>? SortBy { get; set; }

    protected override void OnParametersSet()
    {
        if (SortByExpression is not null)
            SortBy = GridSort<TGridItem>.ByAscending(SortByExpression);
        base.OnParametersSet();
    }

    protected override void CellContent(RenderTreeBuilder builder, TGridItem item)
    {
        OpenCellContent(builder);
        builder.AddContent(2, ChildContent(item));
        CloseCellContent(builder);
    }

    protected override bool IsSortableByDefault() => SortBy is not null;
}
