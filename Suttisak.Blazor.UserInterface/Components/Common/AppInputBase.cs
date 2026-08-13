using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Forms;

namespace Suttisak.Blazor.UserInterface.Components.Common;

public abstract class AppInputBase<TValue> : InputBase<TValue>
{
    private readonly string _generatedId = $"app-input-{Guid.NewGuid():N}";

    [Parameter] public string? Id { get; set; }
    [Parameter] public string? Label { get; set; }
    [Parameter] public string? Description { get; set; }
    [Parameter] public bool Required { get; set; }
    [Parameter] public bool Disabled { get; set; }
    [Parameter] public bool ShowValidationMessage { get; set; } = true;

    protected string InputId => Id ?? _generatedId;
    protected string? DescriptionId => string.IsNullOrWhiteSpace(Description) ? null : $"{InputId}-description";
    protected string ValidationId => $"{InputId}-validation";
    protected string? ValidationMessage => EditContext?.GetValidationMessages(FieldIdentifier).FirstOrDefault();
    protected bool HasValidationError => !string.IsNullOrWhiteSpace(ValidationMessage);
    protected string DescribedBy => string.Join(' ', new[]
    {
        DescriptionId,
        ShowValidationMessage && HasValidationError ? ValidationId : null
    }.Where(value => !string.IsNullOrWhiteSpace(value)));
    protected string ContainerClass => $"app-form-control{(HasValidationError ? " has-error" : string.Empty)}";
    protected string InputClass => $"app-form-control__input {CssClass}";
}
