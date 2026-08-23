# Suttisak.Blazor

Reusable Blazor UI and identity libraries.

> **Source availability:** This repository is publicly visible for transparency, evaluation, collaboration, and development. It is **not currently offered under an open-source license**. Copyright is retained by the repository owner; see [Copyright and use](#copyright-and-use) below.

## Identity route adapters

Add the `Suttisak.Blazor.Identity.Generator` project (or package) as an analyzer to
your Blazor host, then request the generated non-generic route components once:

```csharp
[assembly: GenerateIdentityRouteAdapters(typeof(ApplicationUser), Namespace = "MyApp.Identity")]
```

The generator supplies routes for the reusable account and manage screens. Your
application keeps ownership of `/Account/Register`, so it can use its own input
model and derive from `RegistrationPage<TUser, TInput>` when desired.

`/Account/Manage` is backed by the generic `Manage<TUser>` dashboard. Hosts that
still own a handwritten route page should inherit from the closed type:

```razor
@inherits Manage<ApplicationUser>
```

Wrap the application router with `IdentityUiProvider` to add optional
application-owned branding without coupling the Identity package to product
assets:

```razor
<IdentityUiProvider>
    <Brand>Your product mark</Brand>
    <LoginShowcase>Your sign-in showcase</LoginShowcase>
    <AccountHelp>Your support link</AccountHelp>
    <IdentityFooter>Your legal footer</IdentityFooter>
    <ChildContent>
        <Routes />
    </ChildContent>
</IdentityUiProvider>
```

## User interface components

- Library overview: [`Suttisak.Blazor.UserInterface/README.md`](Suttisak.Blazor.UserInterface/README.md)
- Repository guidance for agents: [`Suttisak.Blazor.UserInterface/AGENTS.md`](Suttisak.Blazor.UserInterface/AGENTS.md)
- Marketing component reference and examples: [`Suttisak.Blazor.UserInterface/Components/Marketing/README.md`](Suttisak.Blazor.UserInterface/Components/Marketing/README.md)
- Reader/result experience components: [`Suttisak.Blazor.UserInterface/Components/Experience/README.md`](Suttisak.Blazor.UserInterface/Components/Experience/README.md)
- Run the design-system Playbook: `dotnet run --project Suttisak.Blazor.Playbook/Suttisak.Blazor.Playbook.csproj`

The Playbook is both a human and machine-facing component workbench:

- `/catalog` — searchable metadata-driven component documentation index.
- `/components` — live Component Browser and integration specimens.
- `/components/{slug}` — deep-linkable component detail pages with status, responsive preview, API metadata, states, and relationships.
- `/foundations` — semantic color, typography, spacing, radius, and motion contracts.
- `/guidelines` — accessibility, theming, responsive, maturity, and agent workflow rules.
- `/component-manifest.json` — machine-readable component map for agents and tooling.

## Component verification

The fast component suite uses bUnit:

```powershell
dotnet test Suttisak.Blazor.UserInterface.Tests/Suttisak.Blazor.UserInterface.Tests.csproj
```

The Playbook browser suite exercises the compiled WebAssembly application, including axe accessibility checks, component documentation routes, manifest integrity, and the virtual-grid specimen:

```powershell
Push-Location Suttisak.Blazor.Playbook.E2ETests
npm install
npm run install:browsers
npm test
Pop-Location
```

Pull requests that touch the UI library or Playbook run the same build, bUnit, Chromium, and accessibility verification in `.github/workflows/playbook-pr.yaml`.

## Contributing and security

Contribution guidance is in [`CONTRIBUTING.md`](CONTRIBUTING.md). Security-sensitive reports must follow [`SECURITY.md`](SECURITY.md) and should never be posted in a public issue or pull request.

## Copyright and use

Copyright © Suttisak Denduangchai. All rights reserved.

No open-source license is currently granted for this repository. Public access to the source code does not grant permission to copy, modify, distribute, sublicense, sell, or otherwise reuse the software outside permissions that arise directly from GitHub's Terms of Service or separate written authorization from the copyright holder.

If an open-source license is adopted in the future, it will be published explicitly in this repository and will apply according to its own terms.
