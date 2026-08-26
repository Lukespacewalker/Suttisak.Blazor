# Suttisak.Blazor.UserInterface

Reusable Razor components, layouts, navigation, theming, and presentation building blocks for Suttisak Blazor applications.

## Component areas

- `Components/Common`: context-independent primitives.
- `Components/Marketing`: landing, product, about, contact, and campaign page building blocks.
- `Components/Navigation`: application navigation.
- `Layouts`: shared page shells.

See [`Components/Marketing/README.md`](Components/Marketing/README.md) for the Marketing API, ownership boundaries, and Razor examples.

Agents editing this project must also follow [`AGENTS.md`](AGENTS.md).

## Global CSS bundling

The package ships an opt-in MSBuild target that concatenates application global CSS into one static-web-asset file. It needs no Node.js or `package.json`. Keep the entry file and partials as source-only files, then declare their intended order in the consuming project's `.csproj`:

```xml
<PropertyGroup>
  <SuttisakBlazorBundleGlobalCss>true</SuttisakBlazorBundleGlobalCss>
  <SuttisakBlazorGlobalCssBundleOutput>wwwroot\css\app.css</SuttisakBlazorGlobalCssBundleOutput>
</PropertyGroup>

<ItemGroup>
  <SuttisakBlazorGlobalCssSource Include="wwwroot\css\app.source.css" />
  <SuttisakBlazorGlobalCssSource Include="wwwroot\css\components\_forms.css" />
  <SuttisakBlazorGlobalCssSource Include="wwwroot\css\themes.css" />
</ItemGroup>
```

Reference only `app.css` from the host page. Source items aren't published, and the bundled output is a normal Static Web Asset.

For immutable URLs, use the host's static-asset fingerprinting mechanism. ASP.NET Core-hosted applications should use `MapStaticAssets` and resolve links through `@Assets[...]`. A standalone Blazor WebAssembly publish doesn't rewrite CSS links to fingerprinted filenames, so it needs a deployment/CDN asset-rewrite step if immutable filenames are required.

## Marketing quick start

```razor
@using Suttisak.Blazor.UserInterface.Components.Marketing

<MarketingPage SkipTarget="features" SkipText="Skip to features">
    <MarketingHero Title="Product name" Description="Product outcome">
        <Actions>
            <MarketingActionLink Href="/login">Sign in</MarketingActionLink>
        </Actions>
    </MarketingHero>
</MarketingPage>
```

The application remains responsible for copy, localization, routes, authorization, and product assets.

## HTTP status route adapters

The package includes a source generator that places the shared status routes in
the consuming application's assembly. Add the generator as an analyzer when
using a local project reference, then request the routes once:

```csharp
[assembly: GenerateStatusRouteAdapters(
    Namespace = "MyApp.Generated",
    LayoutType = typeof(MainLayout))]
```

It generates `/forbidden`, `/not-found`, `/Error`, and the middleware target
`/status/{StatusCode:int}`. The application's existing `Router` discovers these
components through its normal `AppAssembly`; no additional route assembly is
required. Set `ExcludedPages` to any of `Forbidden`, `NotFound`, `Error`, or
`StatusCode` when an application owns that route.

Configure ASP.NET Core to re-execute status responses through the generated
parameterized route:

```csharp
app.UseStatusCodePagesWithReExecute(
    "/status/{0}",
    createScopeForStatusCodePages: true);
```

Customize the generated pages from the application without editing generated
code. This keeps routing in the generator while brand, copy, links, and support
guidance remain application-owned and ready for localization:

```csharp
builder.Services.AddSuttisakStatusRoutes(options =>
{
    options.BrandName = "AudiogramIQ";
    options.LogoUrl = "/assets/icons/logo.png";
    options.HomeHref = "/";

    options.NotFound.Title = "We couldn't find that hearing record.";
    options.NotFound.Message = "Check the address or return to your workspace.";

    options.Error.Title = "The report could not be prepared.";
    options.Error.Message = "Try again. If it continues, send the reference below to support.";
    options.Error.PrimaryActionLabel = "Try again";
});
```

`Forbidden`, `NotFound`, `Error`, and `Default` each expose `Eyebrow`, `Title`,
`Message`, action labels and destinations, and `FooterText`. The 500 primary
action reloads the current URL by default; set `RetryPrimaryAction = false` and
`PrimaryActionHref` to replace that behavior. Set `ShowRequestId = false` when
an application must not expose an incident reference.

## Design token contract (0.14.0)

Every application imports `wwwroot/css/main.css` and overrides semantic tokens only. Component styles must not contain product colors.

| Role | Tokens |
|---|---|
| Brand | `--app-brand`, `--app-on-brand`, `--app-brand-secondary`, `--app-accent` |
| Brand support | `--app-accent-soft`, `--app-accent-border`, `--app-brand-soft`, `--app-brand-secondary-soft` |
| Surfaces | `--app-background`, `--app-surface`, `--app-surface-muted`, `--app-surface-hover` |
| Glass | `--app-glass-surface`, `--app-glass-surface-strong`, `--app-glass-border`, `--app-glass-shadow` |
| Content | `--app-foreground`, `--app-foreground-muted`, `--app-border`, `--app-grid-line`, `--app-shadow-color` |
| Status | `--app-success`, `--app-success-soft`, `--app-success-border`, and the corresponding `warning` and `danger` roles |
| Typography | `--app-font-body`, `--app-font-heading`, `--app-font-mono` |
| Structure | `--app-space-*`, `--app-radius-*`, `--app-shadow-*`, `--app-duration-*` |

Use explicit `light-dark()` values in application overrides so system, light, and dark preferences share one contract. Start from the logo palette, then choose each surface, content, translucent, and support value for readable contrast. The library does not generate a palette with `color-mix()` and components do not own product colors.

The status family has shared defaults because success, warning, and danger must keep their meaning across products. Override it only when the replacement remains recognizable and accessible.

## Component playbook

Run the live component and theme matrix locally:

```powershell
dotnet run --project Suttisak.Blazor.Playbook/Suttisak.Blazor.Playbook.csproj
```

The playbook has four working areas:

- **Components** renders the reusable Razor components by category and exposes the complete color contract.
- **Landing page** composes the shared Marketing components into a production-shaped sandbox for fast visual iteration.
- **Access pages** exercise login, registration, passkey/OAuth affordances, and standard/custom error routes.
- **Application shell** exercises responsive navigation, subnavigation, CRUD grids, record details, headings, breadcrumbs, and toolbar overflow.

Both pages use a project reference and share controls for AudiogramIQ, BafsWorkout, CoeKPI, ErgoTrack, MentalInsight, and HealthInsight, light/dark mode, and wide/narrow previews.

## Reader-facing experiences

Use `Components/Experience/ExperienceHeading` for result, report, education, and guidance pages. It accepts application-owned details, visual content, and watermark text. Continue to use `PageHeading` for compact CRUD and administration workflows.

For application pages, compose `PageHeading`, `PageActionToolbar`, `AppButton`, `AppCard`, `AppGridShell`, `AppGrid`, `AppGridPaginator`, `FormSection`, `FormGrid`, `FormField`, `FormActions`, `FeedbackBanner`, `AppLoading`, and `StatusPanel`. Landing pages use the Marketing components below; account flows use `IdentityLayout`.

