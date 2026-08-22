# Suttisak.Blazor.UserInterface agent guide

This project is a reusable Razor Class Library. Components must remain independent of application routes, authorization policies, localization resources, and product-specific assets.

## Component discovery first

Before introducing a new UI primitive or raw HTML/CSS contract:

1. Check `Suttisak.Blazor.Playbook/wwwroot/component-manifest.json` for an existing component in the same semantic role.
2. Open the matching Playbook detail route using `components/{kebab-case-component-name}` and inspect its status, API metadata, responsive preview, states, accessibility contract, and related components.
3. Check the focused pattern pages (`form-controls`, `grid-performance`, `landing`, `access/login`, and `application-shell`) for an existing composition before creating another abstraction.
4. Prefer composing existing stable components over creating a near-duplicate component or application-local element with parallel styling.

A public component change is not fully integrated until the Playbook can discover it. When adding, renaming, deprecating, or materially changing a public component, update `PlaybookComponentCatalog`, the machine-readable manifest, and an interactive specimen or pattern where practical.

## Component areas

- `Components/Common`: small primitives that are useful in unrelated contexts, such as `Pill`, `Toolbar`, and `GlassCard`.
- `Components/Experience`: reader-facing result, report, education, and guidance components.
- `Components/Marketing`: composable presentation blocks for landing, product, about, and contact pages.
- `Components/Navigation`: application navigation components.
- `Layouts`: page-level layout shells.

Do not place a component in `Common` only because more than one application uses it. Prefer the narrowest meaningful area. Marketing components may depend on the library's public design tokens, but must not depend on a consuming application's types.

## Design-system contracts

- Consume semantic colors from `wwwroot/css/color.css`; do not derive component palettes from a product hue.
- Reuse typography, spacing, radius, shadow, and motion primitives from `wwwroot/css/application.css` before adding local magic numbers.
- Product identity belongs to consuming applications. Shared components own structure, interaction, semantic roles, and responsive behavior.
- Treat accessibility as part of the public API: preserve native semantics, labels and relationships, keyboard behavior, focus visibility, forced-colors support, and reduced-motion behavior.
- Components should tolerate constrained parent containers rather than assuming a desktop page width.

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

1. Run `dotnet build Suttisak.Blazor.slnx --configuration Release`.
2. Run `dotnet test Suttisak.Blazor.UserInterface.Tests/Suttisak.Blazor.UserInterface.Tests.csproj --configuration Release`.
3. Run the Playbook Playwright suite in `Suttisak.Blazor.Playbook.E2ETests`.
4. Check desktop and constrained component previews, light/dark themes, focus visibility, heading order, and reduced-motion behavior.
5. Confirm the component catalog and `component-manifest.json` still describe the public component set accurately.
