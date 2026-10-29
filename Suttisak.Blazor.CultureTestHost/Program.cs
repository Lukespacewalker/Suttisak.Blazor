using Microsoft.AspNetCore.Localization;
using Suttisak.Blazor.CultureTestHost;
using Suttisak.Blazor.CultureTestHost.Client;
using Suttisak.Blazor.UserInterface.Services;

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseStaticWebAssets();
builder.Services.AddRazorComponents().AddInteractiveServerComponents().AddInteractiveWebAssemblyComponents();
builder.Services.AddBlazorUserInterface(_ => { });
var app = builder.Build();
app.UsePathBase("/test-app");
app.UseRouting();
app.UseRequestLocalization(new RequestLocalizationOptions()
    .SetDefaultCulture("en-US").AddSupportedCultures("en-US", "th-TH").AddSupportedUICultures("en-US", "th-TH"));
app.UseAntiforgery();
app.MapStaticAssets();
app.MapGet("/Culture/Set", (HttpContext context, string culture, string redirectUri) =>
{
    if (culture == "auto") context.Response.Cookies.Delete(CookieRequestCultureProvider.DefaultCookieName);
    else context.Response.Cookies.Append(CookieRequestCultureProvider.DefaultCookieName,
        CookieRequestCultureProvider.MakeCookieValue(new RequestCulture(culture)));
    return Results.LocalRedirect(redirectUri);
});
app.MapRazorComponents<App>().AddInteractiveServerRenderMode().AddInteractiveWebAssemblyRenderMode()
    .AddAdditionalAssemblies(typeof(Routes).Assembly);
app.Run();
