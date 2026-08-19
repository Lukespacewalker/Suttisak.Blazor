using System.Linq.Expressions;
using Bunit;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Forms;
using Microsoft.AspNetCore.Components.Web;
using Suttisak.Blazor.UserInterface.Components.Common;

namespace Suttisak.Blazor.UserInterface.Tests;

public sealed class AppRadioTests
{
    [Fact]
    public void Nullable_enum_values_render_empty_and_named_values()
    {
        using var context = new BunitContext();
        var selected = (ContactMethod?)null;
        var cut = RenderNullableGroup(context, selected, value => selected = value);

        var inputs = cut.FindAll("input.app-choice__native");
        Assert.Equal(2, inputs.Count);
        Assert.Equal(string.Empty, inputs[0].GetAttribute("value"));
        Assert.Equal(nameof(ContactMethod.Email), inputs[1].GetAttribute("value"));

        cut.Render(parameters => parameters
            .Add(component => component.Value, ContactMethod.Email)
            .Add(component => component.ValueChanged, EventCallback.Factory.Create<ContactMethod?>(context, value => selected = value))
            .Add(component => component.ChildContent, NullableEnumRadios));

        Assert.Equal(nameof(ContactMethod.Email), cut.FindAll("input.app-choice__native")[1].GetAttribute("value"));
    }

    [Fact]
    public void Nullable_enum_radio_changes_update_the_bound_value_for_null_and_non_null_values()
    {
        using var context = new BunitContext();
        var model = new RadioModel();
        var editContext = new EditContext(model);
        var cut = context.Render<EditForm>(parameters => parameters
            .Add(component => component.EditContext, editContext)
            .Add(component => component.ChildContent, _ => builder =>
            {
                builder.OpenComponent<AppRadioGroup<ContactMethod?>>(0);
                builder.AddAttribute(1, nameof(AppRadioGroup<ContactMethod?>.Value), model.Selection);
                builder.AddAttribute(2, nameof(AppRadioGroup<ContactMethod?>.ValueExpression), (Expression<Func<ContactMethod?>>)(() => model.Selection));
                builder.AddAttribute(3, nameof(AppRadioGroup<ContactMethod?>.ValueChanged), EventCallback.Factory.Create<ContactMethod?>(context, value => model.Selection = value));
                builder.AddAttribute(4, nameof(AppRadioGroup<ContactMethod?>.ChildContent), NullableEnumRadios);
                builder.CloseComponent();
            }));

        var inputs = cut.FindAll("input.app-choice__native");
        inputs[1].Change(new ChangeEventArgs { Value = nameof(ContactMethod.Email) });
        cut.WaitForAssertion(() =>
        {
            Assert.Equal(ContactMethod.Email, model.Selection);
            Assert.True(editContext.IsModified(() => model.Selection!));
        });

        cut.FindAll("input.app-choice__native")[0].Change(new ChangeEventArgs { Value = string.Empty });
        cut.WaitForAssertion(() => Assert.Null(model.Selection));
    }

    [Fact]
    public void Regular_enum_and_value_types_keep_their_existing_formatted_values()
    {
        using var context = new BunitContext();
        var identifier = Guid.Parse("01234567-89ab-cdef-0123-456789abcdef");
        var enumCut = context.Render<AppRadioGroup<ContactMethod>>(parameters => parameters
            .Add(component => component.Value, ContactMethod.Phone)
            .Add(component => component.ChildContent, RegularEnumRadio));
        var abstractEnumCut = context.Render<AppRadioGroup<Enum>>(parameters => parameters
            .Add(component => component.Value, (Enum)ContactMethod.Phone)
            .Add(component => component.ChildContent, builder =>
            {
                builder.OpenComponent<AppRadio<Enum>>(0);
                builder.AddAttribute(1, nameof(AppRadio<Enum>.Value), (Enum)ContactMethod.Phone);
                builder.AddAttribute(2, nameof(AppRadio<Enum>.Label), "Phone");
                builder.CloseComponent();
            }));
        var valueCut = context.Render<AppRadioGroup<int>>(parameters => parameters
            .Add(component => component.Value, 42)
            .Add(component => component.ChildContent, IntegerRadio));
        var nullableValueCut = context.Render<AppRadioGroup<Guid?>>(parameters => parameters
            .Add(component => component.Value, identifier)
            .Add(component => component.ChildContent, builder =>
            {
                builder.OpenComponent<AppRadio<Guid?>>(0);
                builder.AddAttribute(1, nameof(AppRadio<Guid?>.Value), identifier);
                builder.AddAttribute(2, nameof(AppRadio<Guid?>.Label), "Identifier");
                builder.CloseComponent();
            }));

        Assert.Equal(nameof(ContactMethod.Phone), enumCut.Find("input.app-choice__native").GetAttribute("value"));
        Assert.Equal(nameof(ContactMethod.Phone), abstractEnumCut.Find("input.app-choice__native").GetAttribute("value"));
        Assert.Equal("42", valueCut.Find("input.app-choice__native").GetAttribute("value"));
        Assert.Equal(identifier.ToString(), nullableValueCut.Find("input.app-choice__native").GetAttribute("value"));
    }

    private static IRenderedComponent<AppRadioGroup<ContactMethod?>> RenderNullableGroup(
        BunitContext context,
        ContactMethod? value,
        Action<ContactMethod?> onChanged) => context.Render<AppRadioGroup<ContactMethod?>>(parameters => parameters
            .Add(component => component.Value, value)
            .Add(component => component.ValueChanged, EventCallback.Factory.Create<ContactMethod?>(context, onChanged))
            .Add(component => component.ChildContent, NullableEnumRadios));

    private static readonly RenderFragment NullableEnumRadios = builder =>
    {
        builder.OpenComponent<AppRadio<ContactMethod?>>(0);
        builder.AddAttribute(1, nameof(AppRadio<ContactMethod?>.Value), (ContactMethod?)null);
        builder.AddAttribute(2, nameof(AppRadio<ContactMethod?>.Label), "Not specified");
        builder.CloseComponent();

        builder.OpenComponent<AppRadio<ContactMethod?>>(3);
        builder.AddAttribute(4, nameof(AppRadio<ContactMethod?>.Value), (ContactMethod?)ContactMethod.Email);
        builder.AddAttribute(5, nameof(AppRadio<ContactMethod?>.Label), "Email");
        builder.CloseComponent();
    };

    private static readonly RenderFragment RegularEnumRadio = builder =>
    {
        builder.OpenComponent<AppRadio<ContactMethod>>(0);
        builder.AddAttribute(1, nameof(AppRadio<ContactMethod>.Value), ContactMethod.Phone);
        builder.AddAttribute(2, nameof(AppRadio<ContactMethod>.Label), "Phone");
        builder.CloseComponent();
    };

    private static readonly RenderFragment IntegerRadio = builder =>
    {
        builder.OpenComponent<AppRadio<int>>(0);
        builder.AddAttribute(1, nameof(AppRadio<int>.Value), 42);
        builder.AddAttribute(2, nameof(AppRadio<int>.Label), "Forty-two");
        builder.CloseComponent();
    };

    private enum ContactMethod
    {
        Email,
        Phone
    }

    private sealed class RadioModel
    {
        public ContactMethod? Selection { get; set; }
    }
}
