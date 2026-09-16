# Reusable grid actions

## Outcome and design

Apps referencing Suttisak.Blazor.UserInterface can compose the same row action
disclosure and contextual selection toolbar as Playbook without referencing
Playbook assemblies or copying its CSS/JavaScript. AppGrid remains the typed
QuickGrid wrapper. Application callbacks retain ownership of data, routes,
authorization, confirmation, persistence, and localized labels.

The linked conversation proposed public components, but PR #48 deliberately
implemented Playbook-local helpers. This decision supersedes that restriction.
The existing row/grid/batch action placement policy remains current.

- AppActionMenu: compact AppButton trigger, application-owned ChildContent,
  accessible name, disabled state and additional attributes. A native auto
  popover escapes scrolling grids, dismisses on Escape/outside click and
  restores focus. Contents use native button/link semantics and Tab navigation.
- AppGridSelectionToolbar: selected count, application-owned Actions and
  optional summary template, localized labels, clear callback and busy state.
  AppGridShell continues to replace its regular toolbar when selection is active.
- Selection must apply to the sorted rendered window, including pagination
  and virtualization. Preserve provider cancellation and async query support.
- Canonical examples invoke real callbacks against disposable in-memory data;
  edits save, exports download, and deletes require confirmation. No production
  data or backend logic is added to the shared library.

## Plan and acceptance

- [x] Inspect source, public catalog, deployed specimen and linked conversation;
  establish isolated branch and run existing focused tests (6 passed).
- [x] Add regressions for sorted page selection and public action contracts;
  observe failures, implement shared components and selection correction.
- [x] Replace Playbook-local helpers; make exemplar actions executable; register
  public API, focused usage, patterns and regenerate component-manifest.json.
- [x] Verify bUnit contracts, complete Release solution build/test, full Playbook
  E2E, actual desktop/constrained/light/dark/keyboard/reduced-motion states.
- [x] Obtain independent read-only review of a frozen target for selection and
  destructive-action safety; resolve findings and rerun affected checks.
- [ ] Bump UI library version, build a real consumer via Debug source reference,
  commit/push library, wait for CI, explicitly dispatch package publishing.
- [ ] After publication, update all Release references in the six documented
  consumers; restore/build each sequentially, commit/push each.

## Constraints and evidence

Root owns implementation and integration. Review is independent and read-only.
Use semantic tokens and CSS isolation; preserve native focus, labels, forced
colors and reduced motion. Do not change consumer Debug ProjectReferences.
Existing dependency update d133e3b is baseline and is not part of this change.
Record verification evidence and any release blocker here before completion.

### Local verification

- Release solution build: passed, zero warnings and errors on the final local build.
- Shared component tests: 70 passed. New regressions cover sorted pagination,
  provider replacement/cancellation, async query execution, public component
  contracts, localization, disabled/busy state, and consumer callbacks.
- Full Chromium suite: 237 passed before the final sticky-header focus fix.
  The affected suite then passed all 8 tests, including the added focus regression.
  CI must run the complete final suite before publishing.
- Browser checks executed against local disposable data: keyboard/arrow/Escape
  and outside dismissal, mobile light/dark constrained previews with reduced
  motion and axe, exact CSV IDs for sorted and scrolled virtual windows, saved
  edits, cancelled/confirmed batch deletion, and deleting unselected B while
  preserving selected A. Native focus transfers and sticky-header occlusion found
  during these checks were corrected and covered by regression tests.
- CoeKPI Debug source-reference proof: an isolated checkout compiled a temporary
  Razor consumer of both public components and AppGrid, without a Playbook
  reference. Build passed with three pre-existing Identity warnings. The probe
  is not part of the release.
- Independent read-only reviewer checked exact SHA-256 frozen deltas. Earlier
  findings (row confirmation scope and sticky-header focus) are fixed. Successor
  v3 received PASS for code acceptance; full CI remains a publishing gate.
- Release work is isolated in codex/reusable-grid-actions; unrelated dirty
  changes in the original checkout and consuming repositories are preserved.
- First CI run at 44cc2ac: 236 browser tests passed, one existing iframe-readiness
  test passed on retry, and the new focus test failed before virtualization was
  visible. Test setup now scrolls the grid into view before waiting for virtual
  rows and waits for iframe contents before measuring width. All assertions and
  timeouts are preserved. The affected 32 browser tests passed locally without
  retries; a successful CI rerun is still required before publishing.
- Documentation integration 6335fab contains 63b647f and preserves the reusable
  library source and grid-action regressions unchanged. Its new push superseded
  the in-progress CI for 63b647f. Root fast-forwarded this isolated checkout and
  reran the Release build (one existing Identity BL0008 warning) and shared tests
  (71 passed). The documentation task records a full 245/245 local browser run
  against this integration. Publishing now waits for CI on 6335fab.
- CI 35043329890 on 6335fabb662711886fe87fd9601880abc8112c97 passed: 71 shared
  tests, 245 browser tests with no retries, and NuGet package production checks.
  Release workflow 35044052713 was explicitly dispatched for this exact SHA and
  only Suttisak.Blazor.UserInterface. This supersedes the pending CI notes above.
- Playbook deployment 35044030051 succeeded. Root used BrowserOS on the deployed
  AppActionMenu route: public API metadata and the shared specimen were present;
  the second row's Delete action opened a dialog naming only that record, and
  cancelling preserved the row. These were executed interactions on disposable
  in-memory example data, separate from the source review.
- Release 35044052713 stopped before publishing: 244 browser tests passed but
  the virtual export test's five-second table-startup assertion failed twice.
  Investigation found the established 100k-row tests in playbook.spec.mjs already
  allow 20 seconds for WebAssembly startup and initial rows. A temporary CPU4x
  diagnostic reproduced the five-second failure without page errors; the table
  became ready after 11.0 seconds. The two new virtual-grid tests now share that
  existing 20-second startup budget, while keeping their five-second interaction
  assertions, exact export/focus criteria, and 30-second overall test deadlines.
  Exact copies of both revised tests passed under CPU4x in 14.8 and 12.8 seconds.
  The temporary diagnostic test was removed; CI and package publication must
  succeed on the corrected test revision before consumer updates.
- Startup-budget delta received independent read-only PASS; all eight normal
  grid browser tests also passed in 11.7 seconds without retries.
