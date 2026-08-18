using System.Linq.Expressions;
using Bunit;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Forms;
using Microsoft.AspNetCore.Components.Web;
using Suttisak.Blazor.UserInterface.Components.Common;

namespace Suttisak.Blazor.UserInterface.Tests;

public sealed class CardMenuTests
{
    [Fact]
    public void Url_menu_is_a_semantic_link_and_encodes_plain_text()
    {
        using var context = new BunitContext();
        var cut = context.Render<CardMenu>(parameters => parameters
            .Add(component => component.Url, "/records")
            .Add(component => component.Title, "Records")
            .Add(component => component.Subtitle, "<img src=x onerror=alert(1)>")
            .Add(component => component.AriaLabel, "Open records"));

        var link = cut.Find("a.card-menu");
        Assert.Equal("/records", link.GetAttribute("href"));
        Assert.Equal("Open records", link.GetAttribute("aria-label"));
        Assert.Empty(link.QuerySelectorAll("img"));
        Assert.Contains("&lt;img", cut.Markup, StringComparison.Ordinal);
    }

    [Fact]
    public void Disabled_action_menu_is_a_disabled_button_that_does_not_invoke_callback()
    {
        using var context = new BunitContext();
        var clicks = 0;
        var cut = context.Render<CardMenu>(parameters => parameters
            .Add(component => component.Title, "Delete")
            .Add(component => component.Disabled, true)
            .Add(component => component.OnClick, EventCallback.Factory.Create<MouseEventArgs>(context, _ => clicks++)));

        var button = cut.Find("button.card-menu");
        Assert.True(button.HasAttribute("disabled"));
        button.Click();
        Assert.Equal(0, clicks);
    }
}

public sealed class AppTabsTests
{
    [Fact]
    public void Arrow_keys_use_roving_tab_selection_and_update_the_active_panel()
    {
        using var context = new BunitContext();
        context.JSInterop.Mode = JSRuntimeMode.Loose;
        var cut = context.Render<TabsHarness>();

        cut.WaitForAssertion(() => Assert.True(cut.FindAll("[role=tab]")[0].HasAttribute("aria-selected")));
        var tabs = cut.FindAll("[role=tab]");
        Assert.Equal("0", tabs[0].GetAttribute("tabindex"));
        Assert.Equal("-1", tabs[1].GetAttribute("tabindex"));

        tabs[0].KeyDown(new KeyboardEventArgs { Key = "ArrowRight" });

        cut.WaitForAssertion(() =>
        {
            var updated = cut.FindAll("[role=tab]");
            Assert.True(updated[1].HasAttribute("aria-selected"));
            Assert.Equal("0", updated[1].GetAttribute("tabindex"));
            Assert.True(cut.FindAll("[role=tabpanel]")[0].HasAttribute("hidden"));
            Assert.False(cut.FindAll("[role=tabpanel]")[1].HasAttribute("hidden"));
        });
    }

}

public sealed class AppGridSelectionTests
{
    [Fact]
    public void Single_selection_is_reported_and_survives_a_new_item_instance_with_the_same_key()
    {
        using var context = new BunitContext();
        GridRow? selected = null;
        var firstRows = new[] { new GridRow(1, "Alpha"), new GridRow(2, "Beta") };
        var cut = context.Render<AppGrid<GridRow>>(parameters => parameters
            .Add(component => component.Items, firstRows.AsQueryable())
            .Add(component => component.ItemKey, row => row.Id)
            .Add(component => component.SelectionMode, AppGridSelectionMode.Single)
            .Add(component => component.SelectedItemChanged, EventCallback.Factory.Create<GridRow?>(context, row => selected = row))
            .Add(component => component.ChildContent, GridColumns()));

        cut.WaitForAssertion(() => Assert.Equal(2, cut.FindAll("tbody tr").Count));
        cut.FindAll("tbody tr")[0].Click();
        cut.WaitForAssertion(() => Assert.Equal(1, selected?.Id));

        var refreshedRows = new[] { new GridRow(1, "Alpha updated"), new GridRow(2, "Beta") };
        cut.Render(parameters => parameters
            .Add(component => component.Items, refreshedRows.AsQueryable())
            .Add(component => component.ItemKey, row => row.Id)
            .Add(component => component.SelectionMode, AppGridSelectionMode.Single)
            .Add(component => component.SelectedItemChanged, EventCallback.Factory.Create<GridRow?>(context, row => selected = row))
            .Add(component => component.ChildContent, GridColumns()));

        cut.WaitForAssertion(() =>
        {
            var rows = cut.FindAll("tbody tr");
            Assert.Contains("is-selected", rows[0].ClassName, StringComparison.Ordinal);
            Assert.Contains("Alpha updated", rows[0].TextContent, StringComparison.Ordinal);
        });
    }

    private static RenderFragment GridColumns() => builder =>
    {
        builder.OpenComponent<AppGridPropertyColumn<GridRow, string>>(0);
        builder.AddAttribute(1, nameof(AppGridPropertyColumn<GridRow, string>.Property), (Expression<Func<GridRow, string>>)(row => row.Name));
        builder.AddAttribute(2, nameof(AppGridPropertyColumn<GridRow, string>.Title), "Name");
        builder.CloseComponent();
    };

    private sealed record GridRow(int Id, string Name);
}

public sealed class AppMultiSelectValidationTests
{
    [Fact]
    public void SelectedItems_binding_participates_in_edit_context_validation_and_marks_the_field_modified()
    {
        using var context = new BunitContext();
        var model = new TagsModel();
        var editContext = new EditContext(model);
        var messages = new ValidationMessageStore(editContext);
        messages.Add(() => model.Tags, "Choose at least one team.");
        editContext.NotifyValidationStateChanged();

        var cut = context.Render<EditForm>(parameters => parameters
            .Add(component => component.EditContext, editContext)
            .Add(component => component.ChildContent, MultiSelectWithSelectedItems(model, context)));

        var select = cut.Find("select[multiple]");
        Assert.Equal("true", select.GetAttribute("aria-invalid"));
        Assert.Contains("Choose at least one team.", cut.Markup, StringComparison.Ordinal);

        select.Change(new ChangeEventArgs { Value = new[] { "clinical", "operations" } });
        cut.WaitForAssertion(() =>
        {
            Assert.Equal(new[] { "clinical", "operations" }, model.Tags);
            Assert.True(editContext.IsModified(() => model.Tags));
        });
    }

    [Fact]
    public void Value_binding_updates_the_bound_collection()
    {
        using var context = new BunitContext();
        var model = new TagsModel();
        var editContext = new EditContext(model);
        var cut = context.Render<EditForm>(parameters => parameters
            .Add(component => component.EditContext, editContext)
            .Add(component => component.ChildContent, MultiSelectWithValue(model, context)));

        cut.Find("select[multiple]").Change(new ChangeEventArgs { Value = new[] { "clinical" } });
        cut.WaitForAssertion(() => Assert.Equal(new[] { "clinical" }, model.Tags));
    }

    private static RenderFragment<EditContext> MultiSelectWithSelectedItems(TagsModel model, BunitContext context) => _ => builder =>
    {
        builder.OpenComponent<AppMultiSelect<string>>(0);
        builder.AddAttribute(1, nameof(AppMultiSelect<string>.Label), "Teams");
        builder.AddAttribute(2, nameof(AppMultiSelect<string>.Options), TagOptions);
        builder.AddAttribute(3, nameof(AppMultiSelect<string>.SelectedItems), model.Tags);
        builder.AddAttribute(4, nameof(AppMultiSelect<string>.SelectedItemsExpression), (Expression<Func<IEnumerable<string>>>)(() => model.Tags));
        builder.AddAttribute(5, nameof(AppMultiSelect<string>.SelectedItemsChanged), EventCallback.Factory.Create<IEnumerable<string>>(context, values => model.Tags = values.ToList()));
        builder.CloseComponent();
    };

    private static RenderFragment<EditContext> MultiSelectWithValue(TagsModel model, BunitContext context) => _ => builder =>
    {
        builder.OpenComponent<AppMultiSelect<string>>(0);
        builder.AddAttribute(1, nameof(AppMultiSelect<string>.Label), "Teams");
        builder.AddAttribute(2, nameof(AppMultiSelect<string>.Options), TagOptions);
        builder.AddAttribute(3, nameof(AppMultiSelect<string>.Value), (IEnumerable<string>)model.Tags);
        builder.AddAttribute(4, nameof(AppMultiSelect<string>.ValueExpression), (Expression<Func<IEnumerable<string>>>)(() => model.Tags));
        builder.AddAttribute(5, nameof(AppMultiSelect<string>.ValueChanged), EventCallback.Factory.Create<IEnumerable<string>>(context, values => model.Tags = values.ToList()));
        builder.CloseComponent();
    };

    private static readonly AppSelectOption<string>[] TagOptions =
    [
        new("clinical", "Clinical"),
        new("operations", "Operations")
    ];

    private sealed class TagsModel
    {
        public List<string> Tags { get; set; } = [];
    }
}

public sealed class PickerLocalizationTests
{
    [Fact]
    public void Calendar_picker_uses_localized_popup_text_and_a_trigger_override_takes_precedence()
    {
        using var context = new BunitContext();
        var text = new AppPickerText
        {
            Locale = "th-TH",
            OpenCalendarLabel = "เปิดปฏิทิน",
            PreviousMonthLabel = "เดือนก่อนหน้า",
            NextMonthLabel = "เดือนถัดไป",
            CalendarDialogLabel = "ปฏิทินนัดหมาย"
        };
        var cut = context.Render<AppCalendarPicker>(parameters => parameters
            .Add(component => component.Text, text)
            .Add(component => component.OpenCalendarLabel, "เลือกวันนัดหมาย"));

        var container = cut.Find("[data-app-calendar]");
        Assert.Equal("th-TH", container.GetAttribute("data-picker-locale"));
        Assert.Equal("เดือนก่อนหน้า", container.GetAttribute("data-picker-previous-month-label"));
        Assert.Equal("เดือนถัดไป", container.GetAttribute("data-picker-next-month-label"));
        Assert.Equal("ปฏิทินนัดหมาย", container.GetAttribute("data-picker-calendar-dialog-label"));
        Assert.Equal("เลือกวันนัดหมาย", cut.Find("[data-calendar-trigger]").GetAttribute("aria-label"));
    }
}
