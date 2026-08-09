using Microsoft.AspNetCore.Components;

namespace Suttisak.Blazor.Identity.Components.Identity;

/// <summary>
/// Optional application-owned content rendered by the shared Identity screens.
/// </summary>
public sealed record IdentityUiSlots(
    RenderFragment? Brand = null,
    RenderFragment? LoginShowcase = null,
    RenderFragment? LoginFooter = null,
    RenderFragment? AccountHelp = null,
    RenderFragment? IdentityFooter = null,
    RenderFragment? ProfileContent = null);
