using Microsoft.AspNetCore.Components.Authorization;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
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
builder.Services.AddBlazorUserInterface(_ => { });

await builder.Build().RunAsync();
