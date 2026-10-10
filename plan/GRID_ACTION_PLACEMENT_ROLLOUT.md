# Grid action placement rollout

Current decision: the user approved the action-scope convention on 2026-10-07.

## Outcome and constraints

- A full-page list puts Add/Create and page-wide Import in `PageHeading.PageActions`, with one primary and optionally one secondary action.
- Search, filters, refresh, column settings and export of the current view stay with the grid.
- Selected-record commands stay in the contextual selection toolbar; per-record commands stay with their row.
- Embedded grids and pages with several grids keep local Add commands beside their grid.
- Preserve authorization, callbacks, disabled/busy conditions, localization, selection and existing workflows. This task does not add whole-row primary activation.
- Root is the sole writer. Read-only auditors cover independent repositories. Preserve all pre-existing dirty/untracked changes and keep package/project references unchanged.

## Work

- [x] Audit AudiogramIQ and MentalInsight, then apply necessary placement changes.
- [x] Audit BafsWorkout and HealthInsight, then apply necessary placement changes.
- [x] Audit CoeKPI and ErgoTrack, then apply necessary placement changes.
- [x] Audit HRASystem and the Playbook examples; reconcile the shared grid-action guideline with this decision while preserving decision history.
- [x] Restore/build changed consumer hosts sequentially for the intended configuration. Run existing relevant renderer/component tests and repository-required checks.
- [x] Review a frozen file-hash/delta snapshot for scope, retained interaction contracts, duplication and constrained heading behavior. Record actual render/interaction evidence separately from source inspection.

## Acceptance

All seven canonical consumer repositories are accounted for, including repositories needing no change. Every moved command appears once in its appropriate region and retains its prior event/route/authorization contract. Builds and affected checks have recorded outcomes; any environmental or pre-existing failure is identified rather than treated as a pass. The reusable library API is unchanged, so no new library package release is required.

## Audit and verification evidence

Implementation and validation are recorded in [the audit report](GRID_ACTION_PLACEMENT_AUDIT.md).

- 7 canonical consuming repositories, 24 Razor files plus localized resources, focused regression tests and the shared guideline.
- All seven hosts build in a usable configuration: six in Release, MentalInsight in Debug. Existing AudiogramIQ Debug and MentalInsight Release API/package mismatches remain outside this change.
- Passing checks: AudiogramIQ 196; BafsWorkout 2 browser journeys; CoeKPI 73; ErgoTrack 222 unit + 77 integration + 2 browser cases; HealthInsight 56; HRASystem 13; MentalInsight 37 architecture + 145 client + 2 browser cases.
- Real desktop/mobile browser interaction covers BafsWorkout, ErgoTrack and MentalInsight. AudiogramIQ and HRASystem have component interaction evidence. CoeKPI and HealthInsight heading composition is source/build checked with existing guard/handler tests.
- Root is sole maker. A fresh read-only reviewer verified all 37 frozen hashes and 36 original baselines, inspected ten desktop/mobile screenshots and independently parsed the three browser TRX reports (6/6 passed). Final verdict: PASS for task placement and safeguards; pre-existing configuration blockers remain explicitly separate.
