# Playbook Remediation Plan

> Owner: Sol
> Created: 2026-08-31
> Status: Complete
> Working definition: Playbook = a first-class Component Browser + a first-class Pattern Library that teaches how shared components compose.

## Outcome

The Playbook must let a developer or agent answer these questions without opening arbitrary source files:

1. What reusable components exist, and what is each one for?
2. What does a component do in its important states?
3. Does it behave correctly in a real constrained viewport?
4. Which production patterns use it?
5. How are the components in a pattern assembled, and what remains application-owned?
6. Can the current view, filters, theme, and viewport be shared as a stable URL?

The existing editorial visual language will be retained. The remediation prioritizes truthful information architecture and executable documentation over a visual redesign.

## Architectural decisions

- `Component`, `Story/Specimen`, and `Pattern` are separate concepts.
- Component coverage is explicit metadata; it is never inferred from an old link format.
- The typed component and pattern catalogs are authoritative for the Playbook UI.
- The checked-in machine manifest is a derived artifact and must be verified against the typed catalogs and the exported public component surface.
- `/components` is the single component discovery surface. `/catalog` remains only as a backward-compatible redirect.
- `/patterns` is a searchable first-class pattern catalog; `/patterns/{slug}` teaches the recipe and links to the executable route.
- Constrained component previews use a real child browsing context. A narrow `div` is not accepted as viewport verification.
- Query-string state is part of the workbench contract for search, coverage, catalog view, and component viewport.
- Existing routes remain valid unless a redirect is deliberately documented and tested.

## Baseline

- [x] Audit the current information architecture, component inventory, patterns, accessibility, and browser behavior.
- [x] Confirm current runtime counts: 93 exported concrete public `IComponent` types, 87 catalog entries, 75 interactive mappings, and 25 distinct specimen types.
- [x] Reproduce the false responsive preview: a 375 px frame still renders `FormGrid` as two columns because the browser viewport remains desktop-sized.
- [x] Confirm existing catalog/category anchor failures and stale counts.
- [x] Run the focused baseline Playwright suites: 31 tests passed.

## Phase 1 — Truthful catalog contracts

- [x] Make coverage kind explicit on every catalog entry; remove link-prefix coverage inference.
- [x] Add the 6 missing exported concrete components or deliberately make them non-public. This plan documents them because they are currently public:
  - [x] `ApplicationPageHeading`
  - [x] `HeaderControl`
  - [x] `HeaderControlWithUser`
  - [x] `ShellProfileControl`
  - [x] `StatusRouteContent`
  - [x] `ParameterizedStatusRouteAdapter`
- [x] Give `AppLogo` an actual runtime type and focused executable specimen.
- [x] Separate these metrics in the UI:
  - [x] catalogued public components
  - [x] components with interactive coverage
  - [x] distinct executable workbenches
  - [x] first-class patterns
  - [x] reference-only contracts
- [x] Remove all hard-coded 90/79/53 catalog counts from UI and documentation.
- [x] Enrich the machine manifest with per-component slug, category, status, coverage, summary, tags, source area, and related pattern IDs.
- [x] Add an invariant test comparing exported concrete public components, typed catalog entries, and machine-manifest entries.
- [x] Add invariant tests for unique slugs, valid component references, valid pattern routes, and valid specimen registrations.

## Phase 2 — First-class Pattern Library

- [x] Introduce `PlaybookPatternDefinition` and `PlaybookPatternCatalog` with:
  - [x] stable slug and route
  - [x] category, maturity, summary, intent, and tags
  - [x] component ingredient IDs
  - [x] composition steps and ownership boundary
  - [x] minimal copyable Razor recipe
  - [x] accessibility/responsive checks
  - [x] executable live route and regression evidence
- [x] Register the existing canonical compositions, including forms, virtualized data, marketing landing, access flow, application shell, record workflow, status routes, and router layouts.
- [x] Add `/patterns` with search, category filters, result count, and deep links.
- [x] Add `/patterns/{slug}` with anatomy, ingredient links, recipe, ownership, quality checks, and a clear launch action.
- [x] Generate the Patterns navigation menu from the pattern catalog.
- [x] Add reverse “Used in patterns” links to component detail pages.
- [x] Use `GridPerformance` as the reference content structure for executable pattern documentation.

## Phase 3 — Component Browser and detail experience

- [x] Keep `/components` as the only discovery implementation and support dense/card views through URL state.
- [x] Convert `/catalog` into a tested redirect to the compact `/components` view.
- [x] Generate category navigation and anchors from one slug function; remove dead `#forms`, `#actions`, and similar links.
- [x] Persist component search, coverage filter, and view in the query string.
- [x] Announce filtered result counts to assistive technology.
- [x] Distinguish a focused component story from a grouped composition specimen.
- [x] Show focused usage markup, source area, component-specific notes, and pattern participation on detail pages.
- [x] Replace same-category “related” guesses with curated pattern relationships.
- [x] Remove hollow detail states: every Reference must have real rationale/API/source guidance, and every Interactive entry must resolve a specimen.
- [x] Correct section numbering and heading hierarchy.

## Phase 4 — Real viewport and reproducible state

- [x] Add a standalone same-origin specimen-host route.
- [x] Render 375/768/1280 constrained previews in an iframe/child browsing context whose actual viewport matches the selected width.
- [x] Keep the full-width in-page workbench for fast inspection where isolation is unnecessary.
- [x] Persist selected component viewport in the query string.
- [x] Pass theme and color-mode state into the isolated preview.
- [x] Verify a media-query component (`FormGrid`) actually changes layout at 375 px.
- [x] Verify an overlay/top-layer component in the isolated context.
- [x] Ensure isolated previews have accessible titles, focus behavior, loading state, and overflow that exposes rather than hides defects.

## Phase 5 — Shell, accessibility, and interaction integrity

- [x] Add a working global skip link.
- [x] Add `type="button"`, named groups, and `aria-pressed` to theme and viewport controls.
- [x] Centralize Playbook theme/mode state and remove competing control ownership where practical.
- [x] Serialize reproducible shell state into URLs where it does not conflict with application-owned demo state.
- [x] Fix broken or inert navigation taught by canonical patterns.
- [x] Ensure destructive demo actions are clearly simulated or require confirmation/undo.
- [x] Add intrinsic image dimensions/fetch priority to above-fold Playbook imagery where dimensions are known.
- [x] Complete reduced-motion coverage for viewport/layout transitions.
- [x] Check desktop, narrow, light, dark, keyboard, heading order, and visible focus.

## Phase 6 — Verification and documentation

- [x] Update component and pattern browser tests to assert invariants instead of hard-coded marketing counts.
- [x] Add tests for `/patterns`, pattern detail routes, component backlinks, query-state restoration, and compatibility redirects.
- [x] Add tests proving category anchors resolve.
- [x] Add tests proving the 375 preview triggers real media-query behavior.
- [x] Run `dotnet build Suttisak.Blazor.slnx --configuration Release`.
- [x] Run `dotnet test Suttisak.Blazor.UserInterface.Tests/Suttisak.Blazor.UserInterface.Tests.csproj --configuration Release`.
- [x] Run the complete Playbook Playwright suite.
- [x] Run BrowserOS visual QA on Components, one focused component, Patterns, one pattern detail, and one executable pattern.
- [x] Update README counts and Playbook route documentation from verified catalog values.
- [x] Confirm `git status` contains only intentional changes.

## Acceptance criteria

- [x] The public concrete component inventory, typed catalog, and machine manifest contain the same component names.
- [x] No Playbook page contains hard-coded component/workbench/pattern counts.
- [x] Pattern count means Pattern artifacts, never components that merely link to another page.
- [x] Every component detail has useful preview or reference content, API/source guidance, and pattern relationships when applicable.
- [x] Every first-class pattern names its ingredients and contains a usable Razor recipe.
- [x] Search/filter/view/viewport links reproduce the same state after reload.
- [x] A 375 px preview changes viewport-media-query behavior in the rendered component.
- [x] Component and Pattern navigation contain no missing fragment or route targets.
- [x] Release build, unit tests, complete browser tests, and BrowserOS QA pass.

## Completion evidence

- Generated manifest: 93 public components, 76 interactive mappings, 26 distinct workbenches, 8 first-class patterns, and 48 components with pattern backlinks.
- Catalog invariants: 5/5 passed, including exported public surface, manifest equality, unique metadata, specimen registrations, routes, and Pattern backlinks.
- Release solution build: passed.
- Unit tests: 49/49 passed.
- Complete Playwright suite: 226/226 passed with 2 workers in 3.2 minutes.
- BrowserOS QA: Components, Pattern Browser, Pattern Detail, and a dark MentalInsight 375 px isolated `FormGrid` were inspected. The child browsing context measured 375 px, rendered one grid column, preserved dark/theme state, and had zero document overflow.
- Responsive overlay proof: the isolated AppDialog test verifies that a top-layer dialog remains inside the child browsing context.
- Independent final review: all reported P1 issues were resolved (recipe API correctness, visible overflow, complete Pattern backlinks, query-preserving category jumps, and plan evidence).
