using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Rendering;

namespace Suttisak.Blazor.Identity.Pages.Identity;

/// <summary>
/// Base used by generated route adapters. The host application closes the user
/// type at build time, while this component renders the shared Identity screen.
/// </summary>
public abstract class IdentityRouteAdapter<TUser> : ComponentBase where TUser : class
{
    protected abstract Type ScreenType { get; }

    [Parameter(CaptureUnmatchedValues = true)]
    public IReadOnlyDictionary<string, object>? RouteParameters { get; set; }

    protected override void BuildRenderTree(RenderTreeBuilder builder)
    {
        builder.OpenComponent(0, ScreenType);
        builder.AddMultipleAttributes(1, RouteParameters);
        builder.CloseComponent();
    }
}
