# Nexora concept refinement, UI 1.0.31

This refinement follows the approved 4 October concept review and supersedes
the 1.0.30 heading presentation while preserving that release's responsive
content behavior. Publication and consumer integration are owned by the main
MentalInsight session; this document does not claim that 1.0.31 is published.
The GitHub Packages version list was checked on 4 October 2026 and ended at
1.0.30 before the version bump.

The supplied concepts use a strong page title, quiet utility chrome, soft
content surfaces, and readable tables. Nexora now applies that hierarchy to
existing components rather than adding another primitive:

- PageHeading and ExperienceHeading use larger host-provided title typography
  at desktop widths and compact typography in narrow parent containers.
  Both headings and their shell breadcrumbs sit directly on the page background.
  Section context, actions, navigation, and meaningful visuals retain their slots.
- ApplicationShell uses the existing PanelLeftContract/PanelLeftExpand icons
  for its Nexora desktop control. It keeps the existing accessible names,
  expanded state, independent desktop/mobile state, and mobile hamburger/close
  symbol. An inherited mobile navigation gap is also corrected: Escape while
  focus is inside an open drawer closes it and restores focus to the menu button.
  Nested native overlays retain their Escape; desktop collapse is unaffected.
- Theme/culture buttons and profile chrome recede visually while selected
  states and focus remain explicit. Header controls still have no appearance
  dropdown. Saved appearances and default appearance resolution are unchanged.
- Cards and grid shells use a softer neutral boundary. Grid command bars and
  footers use the content surface; table headings use sentence case and calm
  fill. Nonvirtualized table cells use compact spacing. Virtualized rows keep
  their existing geometry.

The shared library still owns no application routes, imagery, localization,
clinical scales, or copper palette. Accent, on-accent, and heading font remain
host-controlled. Standard, Essential, and Quiet Luxury keep their existing
heading and menu presentation. Existing public component signatures remain;
the header preference and paginator options below are additive.
Forced colors and reduced motion retain their existing behavior, with explicit
selected utility outlines and neutral surface boundaries in forced colors.

Verification evidence is saved in
`C:/Users/Sutti/.codex/artifacts/mentalinsight-nexora-concept-20261004/library`.
The responsive workspace suite executes actual search, sort, selection, editor,
navigation, and focus interactions at 768/1024/1440 px in both modes. Heading
tests cover 320/390/768/1024/1440 px and a 320 px desktop parent, including the
following primary task, visuals, host typography/accent, keyboard focus, and
accessibility. See the final verification report there for executed results.

## Header preference popovers and numbered pagination

Hosts can opt into two quiet icon buttons by setting `BlazorUIOptions.CompactHeaderPreferences = true`. `MainLayout` forwards that setting and `HeaderThemeLabel` / `HeaderLanguageLabel` to `ApplicationShell`. The default remains `false`, so existing consumers retain their header composition. The opt-in applies across the host's saved appearances and uses each appearance's semantic tokens.

The shell composes its existing theme and language fragments through `PreferencesSelector` inside native `popover="auto"` groups. HeaderControl and HeaderControlWithUser use that same component and host opt-in. Buttons have application-configured accessible names and unique popup targets; the browser handles exclusive opening, Escape, outside click, and focus restoration. CSS anchors place the popup under its icon and flip it above when the viewport bottom has insufficient room, with a viewport-positioned fallback. PreferencesSelector adds optional `ThemeContent`, `LanguageContent`, label overrides, and `HeaderOnly` for shell composition. Its normal mobile combined disclosure remains; the shell's mobile drawer continues to use the existing raw fragments and Escape dismissal. Applications continue to own localization, routes, culture persistence, and saved theme preferences.

`AppGridPaginator` now defaults to a result range, native page-size select, and a numbered window with `aria-current="page"`. The first/last pages and nearby pages remain visible on wider containers; narrow containers show the current page and one neighbor on either side. Ellipsis marks skipped page ranges and is not an interactive control. Previous/next remain native disabled buttons at boundaries and in empty/loading states.

New options are `ShowPageNumbers` (true), `ShowPageSizeSelector` (true), `ShowPageInput` (false), `PageSizeOptions` (10/25/50/100), `ShowingLabel`, `PageSizeLabel`, and `PerPageLabel`. The current custom page size is always retained in the options. Changing size resets the shared state to page zero, then emits `ItemsPerPageChanged` and `CurrentPageIndexChanged` once each. Existing parameter signatures, `SummaryTemplate`, localized labels, and callbacks remain available. To retain the earlier numeric-entry presentation, set `ShowPageInput="true"`, `ShowPageNumbers="false"`, and `ShowPageSizeSelector="false"`; `NumberFieldStyle` still controls that field.

The paginator detail page includes 1,248 records, loading/empty results, optional numeric entry, and a custom summary template. `numbered-pagination.spec.mjs` exercises actual page windows, shared grid rows, page-size reset, mobile/constrained parents, light/dark, legacy appearances, keyboard focus, RTL, reduced motion, and forced colors. `compact-shell-preferences.spec.mjs` exercises the opt-in shell popovers and default/mobile composition.

The header and sidebar use subtle 1–3% host-accent gradients over semantic surfaces. Nexora's shell content bottom inset is now 1–1.5rem plus the safe-area inset; document scrolling and the viewport-sized frame remain natural, and applications retain responsibility for fixed-dock clearance inside their content.

Primary AppButton and MarketingAction surfaces share `--nexora-primary-background-image`, `--nexora-primary-shadow`, and `--nexora-primary-hover-shadow`. Application-owned primary links can reuse these tokens with `--app-brand` / `--app-on-brand`. The gradient stays behind the label during hover; the shine is a one-pixel inset edge, so it does not wash out text. Danger variants and disabled/busy behavior remain separate. Forced colors remove decorative gradients and shadows. `nexora-surfaces.spec.mjs` checks real short/long shell geometry and default/gold, copper, blue, and purple text contrast in light/dark.
