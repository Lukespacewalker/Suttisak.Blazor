# Compact grid cards implementation plan

**Goal:** Deliver the approved opt-in container-responsive AppGrid API and three usable Playbook examples, then release the library and update six consumers.
**Owner:** Root implements and integrates inline; a fresh reviewer reviews the frozen final diff.
**Design:** Approved in this chat. Add CompactLayout (Table default / Cards), CompactBreakpoint (640 CSS px), CardTemplate. Preserve ChildContent and existing table behavior. Cards require Pagination and reject Virtualize. Application templates own content and detail navigation; library owns selection, sorting and responsive geometry.

## Constraints and acceptance
- Preserve unrelated dirty primary-checkout changes; work in codex/grid-compact-cards.
- QuickGrid remains the only data/sort/page engine; cards reuse its tracked page. No resize fetches.
- Only the active view is accessible. Restore focus into the new view if resize hides it.
- Use shared semantic tokens and existing components; preserve light/dark, forced colors and reduced motion.
- Compact sorting supports AppGridPropertyColumn and AppGridTemplateColumn. Existing raw QuickGrid columns continue unchanged in Table mode.
- Release only after all required checks and independent review; follow repository release order.

## Steps
- [x] Add failing bUnit tests for invalid configuration, shared page/sort/selection, provider cancellation and no duplicate loads. Implement component, column registration and responsive JS/CSS.
- [x] Add Playbook table/cards/summary-detail recipes, controls, API docs, catalog/manifest, and browser tests for resize, keyboard focus, details, sorting, selection and pagination.
- [x] Build Release solution, run all shared tests and Playbook browser suite; visually inspect desktop/constrained light/dark states. Build a consumer Debug against this source.
- [ ] Freeze target; independently review and fix findings. Bump library version, commit/push, wait for CI, dispatch/wait for package publishing.
- [ ] Update every Release package reference in AudiogramIQ, BafsWorkout, HealthInsight, CoeKPI, ErgoTrack, MentalInsight; restore/build Release sequentially then commit/push each.

## Evidence and rulings
- Baseline: 72 shared tests passed. .NET 10 MTP requires `dotnet test --project ...`; positional project syntax with `-v quiet` ran zero tests and was replaced with the supported command.
- Existing worktree: primary checkout has unrelated Playbook theme changes; not copied or modified.

- Final local evidence: Release solution build passed; 77 shared tests and 256 Playbook browser tests passed; BafsWorkout Debug restore/build passed against this sibling source (pre-existing warnings only).
- Independent reviewer verified HEAD plus 18 file hashes; v1 FAIL for pending sort intent, late JS import, and false dark-theme coverage. Regressions reproduced and fixes verified; v2 PASS. Reviewer had no maker involvement or inherited implementation context, performed source/artifact review read-only in shared checkout.
- Dialog-open resize regression reproduced and fixed; native close falls back to the visible grid when its opener is hidden. Actual light/dark screenshots inspected at 320px.
- CI 36294037159 passed (77 shared tests; 255 browser tests plus one existing virtualized test passed on retry). CI exposed an empty-DOM race in the test: a negative row-label assertion passed during loading. Replaced it with a positive new-row assertion; both affected tests passed five repetitions each without retries. Package source remains frozen at 38846826bdb89172c8a2432c2208b4691f1aebc3.
