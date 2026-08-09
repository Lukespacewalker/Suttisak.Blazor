# Marketing components

Reusable building blocks for landing, product, about, and contact pages. The components own layout, responsive behavior, and visual states. The consuming application owns content and behavior.

Import the namespace:

```razor
@using Suttisak.Blazor.UserInterface.Components.Marketing
```

## Components

### `MarketingPage`

Provides the semantic `--app-*` page surface and an optional keyboard-accessible skip link. Version 0.4.0 removes the former component-specific customization API.

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

Provides the responsive hero composition and decorative backdrop. Keep authorization and routes in the `Actions` slot, and product imagery in the `Media` slot. Set `Variant="MarketingHeroVariant.Editorial"` for an opaque, print-inspired composition with crisp geometric decoration.

```razor
<MarketingHero Title="A focused product message"
               Description="A concise explanation of the product outcome.">
    <Eyebrow><Pill>Product category</Pill></Eyebrow>
    <Actions>
        <MarketingActionLink Href="/login">Sign in</MarketingActionLink>
    </Actions>
    <Media>
        <MarketingProductFrame Label="Product workspace">
            <img src="/assets/product.png" alt="Product preview" />
        </MarketingProductFrame>
    </Media>
</MarketingHero>
```

For the editorial treatment, pair the hero with `EditorialProductStage`:

```razor
<MarketingHero Title="A focused product message"
               Variant="MarketingHeroVariant.Editorial">
    <Media>
        <EditorialProductStage Label="Product workflow illustration">
            <img src="/assets/editorial-product.png" alt="The product workflow" />
        </EditorialProductStage>
    </Media>
</MarketingHero>
```

### `EditorialProductStage`

Presents transparent product artwork on an opaque paper surface with a firm border, offset shadow, and restrained geometric accents. Use `CaptionContent` when the caption needs richer markup; otherwise set `Label`.

### `MarketingProductFrame`

Frames a real product screenshot or a lightweight product-state preview. It intentionally avoids decorative browser controls and keeps the product as the visual focus.

### `MarketingProofStrip` and `MarketingProofItem`

Present verified outcomes, trust statements, or workflow guarantees immediately after the hero. Do not invent metrics.

```razor
<MarketingProofStrip AriaLabel="Product assurances">
    <MarketingProofItem Value="01" Title="Role-aware access" Description="People see only the work relevant to them." />
</MarketingProofStrip>
```

### `MarketingStepList` and `MarketingStep`

Describe one connected workflow in three or four concise stages.

```razor
<MarketingStepList>
    <MarketingStep Number="01" Title="Prepare" Description="Set the context before work begins." />
    <MarketingStep Number="02" Title="Complete" Description="Follow one clear operational path." />
</MarketingStepList>
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

### `MarketingFeatureGrid` and `MarketingCard`

A shared capability grid and semantic feature/support card. Use `Featured` for one emphasized outcome and `Compact` for denser supporting groups.

```razor
<MarketingFeatureGrid>
    <MarketingCard Title="Structured workflow" Featured="true">
        <Visual>...</Visual>
        <p>Describe the outcome rather than implementation details.</p>
    </MarketingCard>
</MarketingFeatureGrid>
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

