using System.Globalization;
using System.Linq.Expressions;
using Microsoft.AspNetCore.Components;

namespace Suttisak.Blazor.UserInterface.Components.Common;

/// <summary>A column that displays a property and can sort by that property's value.</summary>
public abstract class AppGridPropertyColumnBase<TGridItem, TProperty> : AppGridColumn<TGridItem>
{
    private Func<TGridItem, TProperty>? _compiledProperty;

    [Parameter, EditorRequired] public Expression<Func<TGridItem, TProperty>> Property { get; set; } = default!;
    [Parameter] public string? Format { get; set; }
    [Parameter] public IFormatProvider? FormatProvider { get; set; }
    [Parameter] public RenderFragment<TGridItem>? CellTemplateOverride { get; set; }

    internal override string ColumnId => GetMemberName(Property) ?? base.ColumnId;
    internal override string HeaderText => Title ?? GetMemberName(Property) ?? string.Empty;
    internal override RenderFragment<TGridItem> CellTemplate => CellTemplateOverride ?? (item => builder =>
    {
        builder.AddContent(0, FormatValue(Value(item)));
    });

    internal override object? GetSortValue(TGridItem item) => Value(item);

    private TProperty Value(TGridItem item)
    {
        _compiledProperty ??= Property.Compile();
        return _compiledProperty(item);
    }

    private string? FormatValue(TProperty value)
    {
        if (value is null)
            return null;

        return value is IFormattable formattable
            ? formattable.ToString(Format, FormatProvider ?? CultureInfo.CurrentCulture)
            : value.ToString();
    }

    private static string? GetMemberName(Expression<Func<TGridItem, TProperty>>? expression)
    {
        Expression? body = expression?.Body;
        while (body is UnaryExpression { NodeType: ExpressionType.Convert or ExpressionType.ConvertChecked } unary)
            body = unary.Operand;
        return body is MemberExpression member ? member.Member.Name : null;
    }
}
