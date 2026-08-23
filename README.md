<div align="center">

# Suttisak.Blazor

**A source-available Blazor design system, executable component workbench, and reusable identity toolkit for .NET 10.**

[![CI](https://github.com/Lukespacewalker/Suttisak.Blazor/actions/workflows/ci.yaml/badge.svg?branch=master)](https://github.com/Lukespacewalker/Suttisak.Blazor/actions/workflows/ci.yaml)
[![Secret scan](https://github.com/Lukespacewalker/Suttisak.Blazor/actions/workflows/secret-scan.yaml/badge.svg?branch=master)](https://github.com/Lukespacewalker/Suttisak.Blazor/actions/workflows/secret-scan.yaml)
[![Latest release](https://img.shields.io/github/v/release/Lukespacewalker/Suttisak.Blazor?display_name=tag&sort=semver)](https://github.com/Lukespacewalker/Suttisak.Blazor/releases)
[![.NET 10](https://img.shields.io/badge/.NET-10.0-512BD4)](https://dotnet.microsoft.com/)
[![Dependabot](https://img.shields.io/badge/Dependabot-enabled-025E8C?logo=dependabot)](.github/dependabot.yml)
[![Source available](https://img.shields.io/badge/license-source--available-F59E0B)](#copyright-and-use)

[Run the Playbook](#quick-start) · [Explore components](#component-playbook) · [Inspect tokens](#design-token-contract) · [Contribute](CONTRIBUTING.md) · [Security](SECURITY.md)

</div>

> [!IMPORTANT]
> **Source availability:** This repository is publicly visible for transparency, evaluation, collaboration, and development. It is **not currently offered under an open-source license**. Copyright is retained by the repository owner; see [Copyright and use](#copyright-and-use).

## What is in the repository

| Area | Purpose |
|---|---|
| `Suttisak.Blazor.UserInterface` | Shared application components, form primitives, data display, overlays, navigation, layouts, marketing, and reader-facing experiences |
| `Suttisak.Blazor.Icons` | Dependency-free SVG icon components used by the design system |
| `Suttisak.Blazor.Identity.Core` | Shared identity UI primitives and navigation contracts |
| `Suttisak.Blazor.Identity` | Reusable ASP.NET Core Identity pages, regions, and route adapters |
| `*.Generator` | Roslyn source generators that remove repetitive host wiring |
| `Suttisak.Blazor.Playbook` | Human-readable design-system documentation and executable component specimens |
| `Suttisak.Blazor.UserInterface.Tests` | Fast bUnit contract tests |
| `Suttisak.Blazor.Playbook.E2ETests` | Chromium, interaction, responsive, and axe accessibility regression coverage |

The Playbook maintains a metadata-driven catalog of **90 components**. Every component has a stable detail route. **53 components currently have executable workbenches**; the rest are explicitly marked as production-shaped **Pattern** documentation or honest **Reference** coverage rather than being represented by decorative fake demos.

### Design principles

- **Semantic tokens, not product colors.** Shared CSS consumes roles such as `--app-surface`, `--app-foreground`, and `--app-danger`.
- **Composition over product ownership.** Applications retain copy, localization, routes, authorization rules, domain behavior, and assets.
- **Executable documentation.** Interactive components are exercised through real Razor specimens, responsive frames, and browser tests.
- **Accessibility is part of the API.** Keyboard behavior, focus, semantics, reduced motion, containment, and axe checks are treated as public contracts.
- **AI-readable by design.** Component and token manifests give agents a deterministic map before they generate new UI.

## Quick start

### Run the Playbook

Prerequisites:

- .NET SDK 10
- Node.js 24 only when running the browser test suite

```bash
git clone https://github.com/Lukespacewalker/Suttisak.Blazor.git
cd Suttisak.Blazor

dotnet restore Suttisak.Blazor.slnx
dotnet run --project Suttisak.Blazor.Playbook/Suttisak.Blazor.Playbook.csproj
```

The Playbook exposes:

- `/components` for the complete coverage-aware Component Browser
- `/components/{slug}` for deep-linkable component documentation and executable workbenches
- `/catalog` for compact searchable discovery
- `/tokens` and `/foundations` for the manifest-driven design-token explorer
- `/guidelines` for accessibility, theming, responsive behavior, and maturity rules
- `/component-manifest.json` for agents and tooling

### Consume a package

Packages are currently distributed through GitHub Packages. Configure the GitHub NuGet feed for your account, then reference the package needed by the host application.

```xml
<ItemGroup>
  <PackageReference Include="Suttisak.Blazor.UserInterface" Version="0.26.2" />
  <PackageReference Include="Suttisak.Blazor.Identity" Version="0.9.1" />
</ItemGroup>
```

Feed:

```text
https://nuget.pkg.github.com/LukeSpacewalker/index.json
```

Load the packaged CSS contract once in the host:

```html
<link href="_content/Suttisak.Blazor.UserInterface/css/main.css" rel="stylesheet" />
```

### Compose shared UI

```razor
@using Suttisak.Blazor.UserInterface.Components.Common

<FormSection Title="Contact details"
             Description="Update how the team can reach this person.">
    <FormGrid Columns="2">
        <FormField>
            <AppTextBox Label="Display name" @bind-Value="model.Name" />
        </FormField>
        <FormField>
            <AppSelect TValue="string"
                       Label="Department"
                       Options="DepartmentOptions"
                       @bind-Value="model.Department" />
        </FormField>
    </FormGrid>

    <FormActions>
        <AppButton Variant="AppButtonVariant.Primary" OnClick="SaveAsync">
            Save changes
        </AppButton>
    </FormActions>
</FormSection>
```

## Architecture

```mermaid
flowchart TD
    App[Blazor host application] --> UI[Suttisak.Blazor.UserInterface]
    App --> Identity[Suttisak.Blazor.Identity]
    UI --> Icons[Suttisak.Blazor.Icons]
    UI --> UIGenerator[UserInterface Generator]
    Identity --> IdentityCore[Suttisak.Blazor.Identity.Core]
    Identity --> IdentityGenerator[Identity Generator]
    IdentityCore --> UI
    Playbook[Suttisak.Blazor.Playbook] --> UI
    BrowserTests[Playwright + axe] --> Playbook
```

Applications retain ownership of product copy, routing decisions, branding, and domain behavior. The shared libraries own reusable presentation contracts, accessibility behavior, and integration seams.

## Component Playbook

The Component Browser and detail pages are driven by one catalog instead of maintaining a second hand-written navigation list.

| Coverage | Meaning |
|---|---|
| **Interactive** | Executable specimen, responsive widths, runtime API metadata, state controls, and browser accessibility checks |
| **Pattern** | A full application-shaped example because the component depends on surrounding routing, authentication, layout, or content composition |
| **Reference** | Searchable and deep-linkable metadata, maturity, API information when available, and related contracts without pretending a placeholder is a real demo |

The browser reports the current coverage counts at runtime. Registering a new component begins in `PlaybookComponentCatalog`; adding a live workbench is a separate, deliberate registration in `PlaybookSpecimenRegistry`.

Machine-readable catalog:

```text
/component-manifest.json
```

## Design token contract

The public CSS contract and the packaged JSON manifest describe the same token names and default values:

```text
_content/Suttisak.Blazor.UserInterface/css/main.css
_content/Suttisak.Blazor.UserInterface/design-tokens.json
```

The manifest currently contains **71 public tokens across 10 semantic groups**: identity, surfaces, content, feedback, font families, type scale, spacing, shape and elevation, motion, and layout. The `/tokens` page is generated from that manifest, and unit tests verify that it stays synchronized with the first public CSS declarations.

Applications override semantic roles, preferably with explicit light and dark values:

```css
:root {
  --app-brand: light-dark(#475569, #cbd5e1);
  --app-accent: light-dark(#c2410c, #fb923c);
  --app-background: light-dark(#f8f8f5, #151719);
  --app-surface: light-dark(#ffffff, #1d2023);
  --app-foreground: light-dark(#20252b, #f3f4f6);
}
```

Shared component CSS must consume semantic roles. It must not introduce product-specific colors, private aliases, or local magic-number tokens.

## Identity route adapters

Add `Suttisak.Blazor.Identity.Generator` as an analyzer to the host and request generated non-generic route components once:

```csharp
[assembly: GenerateIdentityRouteAdapters(
    typeof(ApplicationUser),
    Namespace = "MyApp.Identity")]
```

The generator supplies reusable account and manage routes. The host keeps ownership of `/Account/Register`, so it can use its own input model and derive from `RegistrationPage<TUser, TInput>` when needed.

Wrap the application router with `IdentityUiProvider` to add application-owned branding without coupling the package to product assets:

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

## Quality gates

| Gate | Scope |
|---|---|
| Solution build | All projects on .NET 10 |
| bUnit | Fast shared-component and token-contract behavior |
| Playwright | Compiled WebAssembly application in Chromium |
| axe | Serious and critical WCAG regressions |
| Gitleaks | Full reachable Git history |
| NuGet pack | Package production validated before release |
| Dependabot | NuGet, npm, and GitHub Actions updates |

Run the fast component suite:

```bash
dotnet test Suttisak.Blazor.UserInterface.Tests/Suttisak.Blazor.UserInterface.Tests.csproj
```

Run the browser suite:

```bash
cd Suttisak.Blazor.Playbook.E2ETests
npm ci
npm run install:browsers
npm test
```

## Release process

- Pull requests run read-only build, unit, browser, accessibility, and full-history secret checks.
- Pushes to `master` run CI and validate that all distributable packages can be packed.
- Release Drafter maintains the next GitHub Release notes from merged pull requests.
- Publishing a GitHub Release triggers a fresh verification run, publishes new package versions to GitHub Packages, and attaches `.nupkg` and `.snupkg` files to the release.
- The intended `master` protection policy is versioned in [`.github/branch-protection.json`](.github/branch-protection.json).

## Documentation

- [User interface overview](Suttisak.Blazor.UserInterface/README.md)
- [Agent guidance](Suttisak.Blazor.UserInterface/AGENTS.md)
- [Common components](Suttisak.Blazor.UserInterface/Components/Common/README.md)
- [Marketing components](Suttisak.Blazor.UserInterface/Components/Marketing/README.md)
- [Reader/result experience components](Suttisak.Blazor.UserInterface/Components/Experience/README.md)
- [Contribution guide](CONTRIBUTING.md)
- [Security policy](SECURITY.md)
- [Branch protection policy](.github/BRANCH_PROTECTION.md)

## Contributing and security

Read [`CONTRIBUTING.md`](CONTRIBUTING.md) before opening a pull request. Security-sensitive reports must follow [`SECURITY.md`](SECURITY.md) and must never be posted in a public issue or pull request.

## Copyright and use

Copyright © Suttisak Denduangchai. All rights reserved.

No open-source license is currently granted for this repository. Public access to the source code does not grant permission to copy, modify, distribute, sublicense, sell, or otherwise reuse the software outside permissions that arise directly from GitHub's Terms of Service or separate written authorization from the copyright holder.

If an open-source license is adopted in the future, it will be published explicitly in this repository and will apply according to its own terms.
