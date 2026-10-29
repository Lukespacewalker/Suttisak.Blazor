using System.Globalization;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using Microsoft.JSInterop;
using Suttisak.Blazor.UserInterface.Services;

var builder = WebAssemblyHostBuilder.CreateDefault(args);
builder.Services.AddBlazorUserInterface(_ => { });
var host = builder.Build();
var js = host.Services.GetRequiredService<IJSRuntime>();
var culture = CultureInfo.GetCultureInfo(await js.InvokeAsync<string>("blazorCulture.get", "en-US"));
CultureInfo.DefaultThreadCurrentCulture = culture;
CultureInfo.DefaultThreadCurrentUICulture = culture;
await host.RunAsync();
