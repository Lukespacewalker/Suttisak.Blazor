using Microsoft.AspNetCore.Components;

namespace Suttisak.Blazor.UserInterface.Components.Common;

/// <summary>Adds accessible row selection checkboxes to an <see cref="AppGrid{TGridItem}"/>.</summary>
public abstract class AppGridSelectColumnBase<TGridItem> : AppGridColumn<TGridItem>
{
    internal override bool IsSelectionColumn => true;
    internal override string ColumnId => "__selection";
    internal override string HeaderText => "Select rows";
    internal override RenderFragment<TGridItem> CellTemplate => _ => _ => { };
}
