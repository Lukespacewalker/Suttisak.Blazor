# Marketing components

Reusable building blocks for landing, product, about, and contact pages. The components own layout, responsive behavior, and visual states. The consuming application owns content and behavior.

Import the namespace:

```razor
@using Suttisak.Blazor.UserInterface.Components.Marketing
```

## Components

### `MarketingPage`

Provides the themed page surface, spacing tokens, and an optional keyboard-accessible skip link.

```razor
<MarketingPage SkipTarget="features" SkipText="Skip to features">
    ...
</MarketingPage>
```

### `MarketingContainer`

Centers content and applies the shared maximum width and responsive gutter.

```razor
<MarketingContainer>...</MarketingContainer>
```

### `MarketingHero`

Provides the responsive hero composition and decorative backdrop. Keep authorization and routes in the `Actions` slot, and product imagery in the `Media` slot.

```razor
<MarketingHero Title="A focused product message"
               Description="A concise explanation of the product outcome.">
    <Eyebrow><Pill>Product category</Pill></Eyebrow>
    <Actions>
        <MarketingActionLink Href="/login">Sign in</MarketingActionLink>
    </Actions>
    <Media><img src="/assets/product.png" alt="Product preview" /></Media>
</MarketingHero>
```

### `MarketingSectionHeader`

Renders a consistent section eyebrow, `h2`, and description. Set `HeadingId` when the parent section uses `aria-labelledby`.

```razor
<MarketingSectionHeader HeadingId="features-title"
                        Title="Core features"
                        Description="The capabilities used every day.">
    <Eyebrow><Pill>Features</Pill></Eyebrow>
</MarketingSectionHeader>
```

### `MarketingActionLink`

An anchor styled as a primary or secondary call to action. `LeadingContent` normally contains an icon.

```razor
<MarketingActionLink Href="/workspace"
                     Variant="MarketingActionVariant.Primary">
    <LeadingContent>...</LeadingContent>
    Open workspace
</MarketingActionLink>
```

### `MarketingCard`

A semantic feature/support card. Use `Featured` for the emphasized card and `Compact` for denser groups. Grid placement remains the responsibility of the parent page.

```razor
<MarketingCard Title="Structured workflow" Featured="true">
    <Visual>...</Visual>
    <p>Describe the outcome rather than implementation details.</p>
</MarketingCard>
```

### `MarketingCallToAction`

Provides the closing callout surface with separate content and actions slots.

```razor
<MarketingCallToAction>
    <Content><h2>Ready to continue?</h2></Content>
    <Actions><MarketingActionLink Href="/login">Sign in</MarketingActionLink></Actions>
</MarketingCallToAction>
```

## Ownership boundary

These components intentionally do not localize strings, inspect authentication state, construct routes, or select assets. Compose those application concerns inside their slots.

