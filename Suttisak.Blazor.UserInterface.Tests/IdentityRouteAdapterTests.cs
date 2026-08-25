using Bunit;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Rendering;
using Suttisak.Blazor.Identity.Pages.Identity;

namespace Suttisak.Blazor.UserInterface.Tests;

public sealed class IdentityRouteAdapterTests
{
    [Fact]
    public void Route_parameters_are_forwarded_to_the_identity_screen()
    {
        using var context = new BunitContext();
        var cut = context.Render(builder =>
        {
            builder.OpenComponent<TestRouteAdapter>(0);
            builder.AddAttribute(1, nameof(TestRouteScreen.CredentialId), "credential-123");
            builder.CloseComponent();
        });

        Assert.Equal("credential-123", cut.Find("[data-credential-id]").TextContent);
    }

    private sealed class TestRouteAdapter : IdentityRouteAdapter<object>
    {
        protected override Type ScreenType => typeof(TestRouteScreen);
    }

    private sealed class TestRouteScreen : ComponentBase
    {
        [Parameter]
        public string? CredentialId { get; set; }

        protected override void BuildRenderTree(RenderTreeBuilder builder)
        {
            builder.OpenElement(0, "span");
            builder.AddAttribute(1, "data-credential-id", true);
            builder.AddContent(2, CredentialId);
            builder.CloseElement();
        }
    }
}
