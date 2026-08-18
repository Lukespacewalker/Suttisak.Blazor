# Service-hosted overlays

`AppOverlayService` is a dependency-free replacement for vendor dialog services.
Register it once per interactive application scope and render one host near the
application layout's end:

```csharp
builder.Services.AddAppOverlays();
```

```razor
<AppOverlayHost />
```

Open an application-owned component with strongly typed result passing. The
body inherits `AppOverlayInstance<TResult>` and receives its normal `[Parameter]`
values. It calls `CloseAsync(result)` or `CancelAsync()`; it has no vendor base
class or instance dependency.

```razor
@inherits AppOverlayInstance<PersonEditModel>

<AppButton OnClick="SaveAsync">Save</AppButton>

@code {
    [Parameter] public PersonEditModel Content { get; set; } = default!;
    private Task SaveAsync() => CloseAsync(Content);
}
```

```csharp
var result = await Overlays.ShowDrawerAsync<PersonEditor, PersonEditModel>(
    new AppOverlayOptions { Title = "Edit person", DrawerSize = AppDrawerSize.Wide },
    AppOverlayParameters.Create((nameof(PersonEditor.Content), draft)));

if (result.HasValue)
    await SaveAsync(result.Value!);
```

Use `ShowDialogAsync` for modal bodies and `ShowDrawerAsync` for side panels.
Both have an overload accepting body/footer `RenderFragment<AppOverlayController>`
when an application does not need a separate body component. `ShowConfirmationAsync`,
`ShowErrorAsync`, and `ShowInformationAsync` supply common vendor-free feedback.
Requests are serialized by the host, so overlapping calls cannot stack native
dialogs or lose their result.
