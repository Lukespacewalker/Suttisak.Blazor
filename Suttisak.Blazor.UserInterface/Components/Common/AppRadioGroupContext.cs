using Microsoft.AspNetCore.Components;

namespace Suttisak.Blazor.UserInterface.Components.Common;

/// <summary>Internal cascading contract shared by <see cref="AppRadioGroup{TValue}"/> and child radios.</summary>
public sealed class AppRadioGroupContext<TValue>
{
    private readonly AppRadioGroup<TValue> _group;

    internal AppRadioGroupContext(AppRadioGroup<TValue> group) => _group = group;

    public string Name => _group.RadioName;
    public string GroupId => _group.GroupId;
    public bool Required => _group.Required;
    public bool Disabled => _group.Disabled;
    public string? Description => _group.Description;
    public string DescribedBy => _group.DescribedByValue;
    public bool HasValidationError => _group.HasValidationErrorValue;
    public TValue CurrentValue => _group.SelectedValue;
    public string CssClass => _group.CssClassValue;
    public Task SetValueAsync(TValue value) => _group.SetCurrentValueAsync(value);
}
