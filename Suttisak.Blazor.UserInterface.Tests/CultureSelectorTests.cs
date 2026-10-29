using Bunit;
using Microsoft.AspNetCore.Components;
using Microsoft.Extensions.DependencyInjection;
using Suttisak.Blazor.UserInterface.Components;
using Suttisak.Blazor.UserInterface.Services;

namespace Suttisak.Blazor.UserInterface.Tests;

public sealed class CultureSelectorTests
{
    [Fact]
    public void Native_fallback_preserves_encoded_url_and_fragment()
    {
        using var context = new BunitContext();
        context.Services.AddOptions<BlazorUIOptions>();
        context.Services.GetRequiredService<NavigationManager>()
            .NavigateTo("/people/person%2Fone?visit=a%26b#results");
        var cut = context.Render<CultureSelector>();

        Assert.Equal("/people/person%2Fone?visit=a%26b#results", cut.Find("input[name=redirectUri]").GetAttribute("value"));
    }
}
