using System.Diagnostics;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Rendering;

namespace Suttisak.Blazor.UserInterface.Routing;

/// <summary>Base component rendered by generated HTTP status routes.</summary>
public abstract class StatusRouteAdapter : ComponentBase
{
    protected abstract int ResponseStatusCode { get; }

    protected override void BuildRenderTree(RenderTreeBuilder builder)
    {
        builder.OpenComponent<StatusRouteContent>(0);
        builder.AddAttribute(1, nameof(StatusRouteContent.StatusCode), ResponseStatusCode);
        builder.AddAttribute(2, nameof(StatusRouteContent.RequestId), Activity.Current?.Id);
        builder.CloseComponent();
    }
}

/// <summary>Route adapter used by the status-code middleware re-execution path.</summary>
public class ParameterizedStatusRouteAdapter : StatusRouteAdapter
{
    [Parameter]
    public int StatusCode { get; set; }

    protected override int ResponseStatusCode => StatusCode;
}
