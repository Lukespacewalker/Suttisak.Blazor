using System.Globalization;
using Microsoft.AspNetCore.Components.Authorization;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using Microsoft.JSInterop;
using Suttisak.Blazor.Playbook;
using Suttisak.Blazor.UserInterface.Services;

var builder = WebAssemblyHostBuilder.CreateDefault(args);
builder.RootComponents.Add<App>("#app");
builder.RootComponents.Add<HeadOutlet>("head::after");
builder.Services.AddScoped(_ => new HttpClient { BaseAddress = new Uri(builder.HostEnvironment.BaseAddress) });
builder.Services.AddSingleton<PlaybookState>();
builder.Services.AddSingleton<DemoRecordStore>();
builder.Services.AddAuthorizationCore();
builder.Services.AddScoped<AuthenticationStateProvider, PlaybookAuthenticationStateProvider>();
builder.Services.AddBlazorUserInterface(options => options.DefaultCulture = "en-US");

var host = builder.Build();
var jsRuntime = host.Services.GetRequiredService<IJSRuntime>();
var storedCultureName = await jsRuntime.InvokeAsync<string?>("blazorCulture.get", "en-US");
if (!string.IsNullOrWhiteSpace(storedCultureName))
{
    try
    {
        var storedCulture = CultureInfo.GetCultureInfo(storedCultureName);
        CultureInfo.DefaultThreadCurrentCulture = storedCulture;
        CultureInfo.DefaultThreadCurrentUICulture = storedCulture;
    }
    catch (CultureNotFoundException)
    {
        await jsRuntime.InvokeVoidAsync("blazorCulture.clear");
    }
}

await host.RunAsync();
