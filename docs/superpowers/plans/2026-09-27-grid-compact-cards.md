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
- [x] Freeze target; independently review and fix findings. Bump library version, commit/push, wait for CI, dispatch/wait for package publishing.
- [x] Update every Release package reference in AudiogramIQ, BafsWorkout, HealthInsight, CoeKPI, ErgoTrack, MentalInsight; restore/build Release sequentially then commit/push each.

## Evidence and rulings
- Baseline: 72 shared tests passed. .NET 10 MTP requires `dotnet test --project ...`; positional project syntax with `-v quiet` ran zero tests and was replaced with the supported command.
- Existing worktree: primary checkout has unrelated Playbook theme changes; not copied or modified.

- Final local evidence: Release solution build passed; 77 shared tests and 256 Playbook browser tests passed; BafsWorkout Debug restore/build passed against this sibling source (pre-existing warnings only).
- Independent reviewer verified HEAD plus 18 file hashes; v1 FAIL for pending sort intent, late JS import, and false dark-theme coverage. Regressions reproduced and fixes verified; v2 PASS. Reviewer had no maker involvement or inherited implementation context, performed source/artifact review read-only in shared checkout.
- Dialog-open resize regression reproduced and fixed; native close falls back to the visible grid when its opener is hidden. Actual light/dark screenshots inspected at 320px.
- CI 36294037159 passed (77 shared tests; 255 browser tests plus one existing virtualized test passed on retry). CI exposed an empty-DOM race in the test: a negative row-label assertion passed during loading. Replaced it with a positive new-row assertion; both affected tests passed five repetitions each without retries. Package source remains frozen at 38846826bdb89172c8a2432c2208b4691f1aebc3.
- Release workflow [36294688916](https://github.com/Lukespacewalker/Suttisak.Blazor/actions/runs/36294688916) passed: 77 shared tests, 256 browser tests without retries, then published only `Suttisak.Blazor.UserInterface` 1.0.24. GitHub Packages confirmed availability on 2026-09-27.
- [Deployed Playbook](https://suttisak-blazor-playbook.pages.dev/components/app-grid) verified in a real browser: responsive controls present, three summary cards in a 360px container, record details opened and closed successfully.
- All six consumers restored and built sequentially in Release using the published package; all 11 Release references updated, Debug references preserved. Consumer tests passed: 742 total across the suites below. Integration suites used disposable PostgreSQL containers.

| Consumer | Pushed commit | Executed tests |
| --- | --- | --- |
| AudiogramIQ | `9ee2a668d93841c6249d0ba08a89620d72d78cb4` | Presentation 21; architecture 11 |
| BafsWorkout | `a07bdac6f3e0899d9f17fbc15b5f317b84a0c6b8` | Client 23; web 41; application/architecture 112 |
| HealthInsight | `848add2679c8fc579b5f06072ddd1bd1b35af6a6` | Architecture 18 |
| CoeKPI | `f3e110e0fb6df57f3771cd161cd35ef895381a7a` | Full solution: 73 |
| ErgoTrack | `3a8c93e6b4b5959077bfc7c9672860a5cd0d35a3` | Unit 222; component 24; architecture 32; integration 77 |
| MentalInsight | `49445845a46e8cd49cca895e775e62c156e0583c` | Client 52; architecture 36 |

- Consumer commits build on the concurrently published 1.0.23 updates fetched before changing versions. AudiogramIQ's primary checkout retains overlapping user work and was not fast-forwarded; its remote master and isolated release checkout contain the verified 1.0.24 update.
- Follow-up CI [36294794866](https://github.com/Lukespacewalker/Suttisak.Blazor/actions/runs/36294794866) passed on test-fix commit 1ff426c5ed57c28fef638ef5c425675a24cf75ed: 77 shared tests and 256 browser tests, no retries. All six host project.assets.json files resolve UserInterface 1.0.24 as a package.
