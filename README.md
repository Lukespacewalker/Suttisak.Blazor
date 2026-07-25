# Suttisak.Blazor

Reusable Blazor UI and identity libraries.

## Identity route adapters

Add the `Suttisak.Blazor.Identity.Generator` project (or package) as an analyzer to
your Blazor host, then request the generated non-generic route components once:

```csharp
[assembly: GenerateIdentityRouteAdapters(typeof(ApplicationUser), Namespace = "MyApp.Identity")]
```

The generator supplies routes for the reusable account and manage screens. Your
application keeps ownership of `/Account/Register`, so it can use its own input
model and derive from `RegistrationPage<TUser, TInput>` when desired.

## User interface components

- Library overview: [`Suttisak.Blazor.UserInterface/README.md`](Suttisak.Blazor.UserInterface/README.md)
- Repository guidance for agents: [`Suttisak.Blazor.UserInterface/AGENTS.md`](Suttisak.Blazor.UserInterface/AGENTS.md)
- Marketing component reference and examples: [`Suttisak.Blazor.UserInterface/Components/Marketing/README.md`](Suttisak.Blazor.UserInterface/Components/Marketing/README.md)
