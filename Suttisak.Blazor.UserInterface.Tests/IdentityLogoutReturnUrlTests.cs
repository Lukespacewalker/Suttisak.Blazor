using System.Reflection;
using Microsoft.AspNetCore.Routing;

namespace Suttisak.Blazor.UserInterface.Tests;

public sealed class IdentityLogoutReturnUrlTests
{
    [Theory]
    [InlineData(null, "/")]
    [InlineData("", "/")]
    [InlineData("/", "/")]
    [InlineData("Account/Login", "/Account/Login")]
    [InlineData("/Account/Login", "/Account/Login")]
    [InlineData("~/Account/Login", "~/Account/Login")]
    [InlineData("https://example.com/", "/")]
    [InlineData("//example.com/", "/")]
    [InlineData("/\\example.com/", "/")]
    public void Logout_return_url_is_normalized_to_a_local_destination(string? input, string expected)
    {
        var method = typeof(IdentityComponentsEndpointRouteBuilderExtensions).GetMethod(
            "NormalizeLocalReturnUrl",
            BindingFlags.NonPublic | BindingFlags.Static);

        Assert.NotNull(method);
        Assert.Equal(expected, method.Invoke(null, [input]));
    }
}
