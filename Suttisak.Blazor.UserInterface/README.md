# Suttisak.Blazor.UserInterface

Reusable Razor components, layouts, navigation, theming, and presentation building blocks for Suttisak Blazor applications.

## Component areas

- `Components/Common`: context-independent primitives.
- `Components/Marketing`: landing, product, about, contact, and campaign page building blocks.
- `Components/Navigation`: application navigation.
- `Layouts`: shared page shells.

See [`Components/Marketing/README.md`](Components/Marketing/README.md) for the Marketing API, ownership boundaries, and Razor examples.

Agents editing this project must also follow [`AGENTS.md`](AGENTS.md).

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

## Design token contract (0.13.0)

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

The playbook has two working pages:

- **Components** renders the reusable Razor components by category and exposes the complete color contract.
- **Landing page** composes the shared Marketing components into a production-shaped sandbox for fast visual iteration.

Both pages use a project reference and share controls for AudiogramIQ, BafsWorkout, CoeKPI, ErgoTrack, MentalInsight, and HealthInsight, light/dark mode, and wide/narrow previews.

## Reader-facing experiences

Use `Components/Experience/ExperienceHeader` for result, report, education, and guidance pages. It accepts application-owned details, visual content, and watermark text. Continue to use `PageHeading` for compact CRUD and administration workflows.

For application pages, compose `PageHeading`, `Toolbar`, `FormSection`, `FormGrid`, `DataGridContainer`, `FeedbackBanner`, `StatusPanel`, and `GlassCard`. Landing pages use the Marketing components below; account flows use `IdentityLayout`.

