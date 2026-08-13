namespace Suttisak.Blazor.UserInterface.Routing;

/// <summary>Application-owned branding and copy for generated HTTP status routes.</summary>
public sealed class StatusRouteOptions
{
    public string BrandName { get; set; } = "Application";
    public string? LogoUrl { get; set; }
    public string HomeHref { get; set; } = "/";
    public string RequestIdLabel { get; set; } = "Reference";
    public bool ShowRequestId { get; set; } = true;

    public StatusRoutePageOptions Forbidden { get; set; } = new()
    {
        Eyebrow = "Access denied",
        Title = "This space is protected.",
        Message = "Your account is signed in, but it does not have permission to view this page.",
        PrimaryActionLabel = "Return to home",
        FooterText = "Your session is still secure"
    };

    public StatusRoutePageOptions NotFound { get; set; } = new()
    {
        Eyebrow = "Page not found",
        Title = "This path ends here.",
        Message = "The page may have moved, or the address may be incomplete.",
        PrimaryActionLabel = "Return to home",
        FooterText = "Nothing was changed"
    };

    public StatusRoutePageOptions Error { get; set; } = new()
    {
        Eyebrow = "System interruption",
        Title = "Something stopped unexpectedly.",
        Message = "Try again in a moment, or return to a known place while the service recovers.",
        PrimaryActionLabel = "Try again",
        RetryPrimaryAction = true,
        SecondaryActionLabel = "Return to home",
        FooterText = "Keep this reference when requesting support"
    };

    public StatusRoutePageOptions Default { get; set; } = new()
    {
        Eyebrow = "Request interrupted",
        Title = "We couldn't complete that request.",
        Message = "Return to a known place and try the action again.",
        PrimaryActionLabel = "Return to home",
        FooterText = "No changes were intentionally made"
    };

    public StatusRoutePageOptions Resolve(int statusCode) => statusCode switch
    {
        403 => Forbidden,
        404 => NotFound,
        >= 500 => Error,
        _ => Default
    };
}

/// <summary>Editable content for one family of HTTP status pages.</summary>
public sealed class StatusRoutePageOptions
{
    public string Eyebrow { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string PrimaryActionLabel { get; set; } = string.Empty;
    public string? PrimaryActionHref { get; set; }
    public bool RetryPrimaryAction { get; set; }
    public string? SecondaryActionLabel { get; set; }
    public string? SecondaryActionHref { get; set; }
    public string FooterText { get; set; } = string.Empty;
}
