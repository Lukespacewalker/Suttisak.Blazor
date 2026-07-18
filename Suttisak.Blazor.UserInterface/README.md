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

