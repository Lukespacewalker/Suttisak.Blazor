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

## Design token contract (0.4.0)

Every application imports `wwwroot/css/main.css` and overrides semantic tokens only. Component styles must not contain product colors.

| Role | Tokens |
|---|---|
| Brand | `--app-brand`, `--app-brand-secondary`, `--app-accent` |
| Surfaces | `--app-background`, `--app-surface`, `--app-surface-muted` |
| Content | `--app-foreground`, `--app-foreground-muted`, `--app-border` |
| Status | `--app-success`, `--app-warning`, `--app-danger` |
| Typography | `--app-font-body`, `--app-font-heading`, `--app-font-mono` |
| Structure | `--app-space-*`, `--app-radius-*`, `--app-shadow-*`, `--app-duration-*` |

Use `light-dark()` in application overrides so system, light, and dark preferences share the same contract. Derived `--app-brand-*` tokens in `color.css` are owned by the library and should not be redeclared by applications.

For application pages, compose `PageHeading`, `Toolbar`, `FormSection`, `FormGrid`, `DataGridContainer`, `FeedbackBanner`, `StatusPanel`, and `GlassCard`. Landing pages use the Marketing components below; account flows use `IdentityLayout`.

