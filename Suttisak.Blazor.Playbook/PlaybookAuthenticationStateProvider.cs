using System.Security.Claims;
using Microsoft.AspNetCore.Components.Authorization;

namespace Suttisak.Blazor.Playbook;

public sealed class PlaybookAuthenticationStateProvider : AuthenticationStateProvider
{
    private static readonly AuthenticationState State = new(new ClaimsPrincipal(new ClaimsIdentity(
    [
        new Claim(ClaimTypes.Name, "Kanda Srisuk"),
        new Claim("display_name", "Kanda Srisuk"),
        new Claim("given_name", "Kanda"),
        new Claim("family_name", "Srisuk")
    ], "Playbook")));

    public override Task<AuthenticationState> GetAuthenticationStateAsync() => Task.FromResult(State);
}
