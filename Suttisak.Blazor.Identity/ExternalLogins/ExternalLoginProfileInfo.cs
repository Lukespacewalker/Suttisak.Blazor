using System.Security.Claims;
using Microsoft.AspNetCore.Identity;

namespace Suttisak.Blazor.Identity;

/// <summary>
/// Human-readable information for an external login. ASP.NET Identity itself retains only
/// the provider and provider key, so applications can persist this separately if desired.
/// </summary>
public sealed record ExternalLoginProfileInfo(
    string LoginProvider,
    string ProviderKey,
    string DisplayName,
    string? Email)
{
    public static ExternalLoginProfileInfo From(ExternalLoginInfo loginInfo)
    {
        var email = GetEmail(loginInfo.Principal);
        var displayName = loginInfo.Principal.FindFirstValue("name")?.Trim();
        displayName = string.IsNullOrWhiteSpace(displayName) ? email : displayName;
        displayName ??= loginInfo.ProviderDisplayName;
        displayName ??= "Connected account";

        return new ExternalLoginProfileInfo(
            loginInfo.LoginProvider,
            loginInfo.ProviderKey,
            displayName,
            email);
    }

    private static string? GetEmail(ClaimsPrincipal principal)
    {
        var email = principal.FindFirstValue(ClaimTypes.Email)
            ?? principal.FindFirstValue("email")
            ?? principal.FindFirstValue("preferred_username");
        return string.IsNullOrWhiteSpace(email) ? null : email.Trim();
    }
}
