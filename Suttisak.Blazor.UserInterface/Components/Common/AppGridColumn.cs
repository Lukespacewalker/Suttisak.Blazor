using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.QuickGrid;
using Microsoft.AspNetCore.Components.Rendering;

namespace Suttisak.Blazor.UserInterface.Components.Common;

/// <summary>Base class for application columns rendered by QuickGrid.</summary>
public abstract class AppGridColumn<TGridItem> : ColumnBase<TGridItem>
{
    /// <summary>
    /// Optional preferred column width. Fixed CSS lengths are applied to cell
    /// content; legacy <c>fr</c> values remain accepted but defer to the table.
    /// </summary>
    [Parameter] public string? Width { get; set; }

    /// <summary>Additional class applied to both header and body cells.</summary>
    [Parameter] public string? HeaderClass { get; set; }

    /// <summary>Compatibility shorthand for QuickGrid's initial sort direction.</summary>
    [Parameter] public bool? InitialSortDescending { get; set; }

    [Parameter] public string? AriaLabel { get; set; }

    protected string? CellStyle => string.IsNullOrWhiteSpace(Width) || Width.EndsWith("fr", StringComparison.OrdinalIgnoreCase)
        ? null
        : $"min-width: {Width}; width: {Width};";

    protected override void OnParametersSet()
    {
        if (InitialSortDescending is not null)
        {
            InitialSortDirection = InitialSortDescending.Value
                ? SortDirection.Descending
                : SortDirection.Ascending;
        }

        if (!string.IsNullOrWhiteSpace(HeaderClass))
        {
            Class = string.Join(' ', $"{Class} {HeaderClass}"
                .Split(' ', StringSplitOptions.RemoveEmptyEntries)
                .Distinct(StringComparer.Ordinal));
        }

        base.OnParametersSet();
    }

    protected void OpenCellContent(RenderTreeBuilder builder)
    {
        if (CellStyle is null)
            return;

        builder.OpenElement(0, "div");
        builder.AddAttribute(1, "style", CellStyle);
    }

    protected void CloseCellContent(RenderTreeBuilder builder)
    {
        if (CellStyle is not null)
            builder.CloseElement();
    }
}
