using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using Microsoft.FluentUI.AspNetCore.Components;
using Suttisak.Blazor.Playbook;

var builder = WebAssemblyHostBuilder.CreateDefault(args);
builder.RootComponents.Add<App>("#app");
builder.RootComponents.Add<HeadOutlet>("head::after");
builder.Services.AddSingleton<PlaybookState>();
builder.Services.AddSingleton<DemoRecordStore>();
builder.Services.AddFluentUIComponents();

await builder.Build().RunAsync();
