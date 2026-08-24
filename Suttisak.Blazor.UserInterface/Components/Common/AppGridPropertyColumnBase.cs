using System.Globalization;
using System.Linq.Expressions;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.QuickGrid;
using Microsoft.AspNetCore.Components.Rendering;

namespace Suttisak.Blazor.UserInterface.Components.Common;

/// <summary>A QuickGrid column that displays and sorts a property value.</summary>
public abstract class AppGridPropertyColumnBase<TGridItem, TProperty> : AppGridColumn<TGridItem>
{
    private Expression<Func<TGridItem, TProperty>>? _lastProperty;
    private Func<TGridItem, TProperty>? _compiledProperty;
    private GridSort<TGridItem>? _sort;

    [Parameter, EditorRequired] public Expression<Func<TGridItem, TProperty>> Property { get; set; } = default!;
    [Parameter] public string? Format { get; set; }
    [Parameter] public IFormatProvider? FormatProvider { get; set; }
    [Parameter] public RenderFragment<TGridItem>? CellTemplateOverride { get; set; }

    public override GridSort<TGridItem>? SortBy
    {
        get => _sort;
        set => _sort = value;
    }

    protected override void OnParametersSet()
    {
        base.OnParametersSet();

        if (!ReferenceEquals(_lastProperty, Property))
        {
            _lastProperty = Property;
            _compiledProperty = Property.Compile();
            _sort = GridSort<TGridItem>.ByAscending(Property);
        }

        Title ??= GetMemberName(Property);
    }

    protected override void CellContent(RenderTreeBuilder builder, TGridItem item)
    {
        OpenCellContent(builder);
        if (CellTemplateOverride is not null)
            builder.AddContent(2, CellTemplateOverride(item));
        else
            builder.AddContent(2, FormatValue(_compiledProperty!(item)));
        CloseCellContent(builder);
    }

    private string? FormatValue(TProperty value)
    {
        if (value is null)
            return null;

        return value is IFormattable formattable
            ? formattable.ToString(Format, FormatProvider ?? CultureInfo.CurrentCulture)
            : value.ToString();
    }

    private static string? GetMemberName(Expression<Func<TGridItem, TProperty>> expression)
    {
        Expression body = expression.Body;
        while (body is UnaryExpression { NodeType: ExpressionType.Convert or ExpressionType.ConvertChecked } unary)
            body = unary.Operand;
        return body is MemberExpression member ? member.Member.Name : null;
    }
}
