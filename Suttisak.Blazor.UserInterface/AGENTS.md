# Suttisak.Blazor.UserInterface agent guide

This project is a reusable Razor Class Library. Components must remain independent of application routes, authorization policies, localization resources, and product-specific assets.

## Component areas

- `Components/Common`: small primitives that are useful in unrelated contexts, such as `Pill`, `Toolbar`, and `GlassCard`.
- `Components/Marketing`: composable presentation blocks for landing, product, about, and contact pages.
- `Components/Navigation`: application navigation components.
- `Layouts`: page-level layout shells.

Do not place a component in `Common` only because more than one application uses it. Prefer the narrowest meaningful area. Marketing components may depend on the library's public design tokens, but must not depend on a consuming application's types.

## Marketing component rules

- Keep copy, routes, authorization, localization, and image selection in the consuming application.
- Accept application-owned markup through named `RenderFragment` slots.
- Preserve semantic HTML and expose IDs needed for `aria-labelledby` and in-page navigation.
- Use CSS isolation and the tokens from `wwwroot/css/color.css`; do not embed product colors.
- Support light/dark themes, keyboard focus, narrow screens, and `prefers-reduced-motion`.
- Avoid a new component that only renames a `div`. Extract a stable visual or semantic contract.
- Add the component and a usage example to `Components/Marketing/README.md` whenever the public API changes.

## Verification

After changing public components:

1. Run `dotnet build Suttisak.Blazor.UserInterface/Suttisak.Blazor.UserInterface.csproj`.
2. Build at least one consuming application through its Debug project reference.
3. Check desktop and mobile layouts, light/dark themes, focus visibility, heading order, and reduced-motion behavior.

