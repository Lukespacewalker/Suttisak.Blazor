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
heading and menu presentation. Public component signatures do not change.
Forced colors and reduced motion retain their existing behavior, with explicit
selected utility outlines and neutral surface boundaries in forced colors.

Verification evidence is saved in
`C:/Users/Sutti/.codex/artifacts/mentalinsight-nexora-concept-20261004/library`.
The responsive workspace suite executes actual search, sort, selection, editor,
navigation, and focus interactions at 768/1024/1440 px in both modes. Heading
tests cover 320/390/768/1024/1440 px and a 320 px desktop parent, including the
following primary task, visuals, host typography/accent, keyboard focus, and
accessibility. See the final verification report there for executed results.
