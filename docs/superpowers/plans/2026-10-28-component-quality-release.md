# Component quality corrections and source release

Goal: correct the approved quality-audit findings in the reusable UI/Identity libraries and their documented compositions, then publish new packages and update the six supported consumers through source commits and application versions.

Design: preserve existing APIs and default standalone presentation. Make error states outrank success, preserve card modifiers under appearance CSS, separate logical page padding, and remove unnecessary override specificity. Add an opt-in embedded StatusPanel presentation, forward it through AsyncContent, and use it inside AppGridShell. Identity actions reuse AppButton; failure pages show title/message once with the existing live-region meaning. Playbook examples use shared inputs/cards and correct documented API wiring. No Docker layer patches, production data changes, authentication policy changes, or unrelated cleanup.

Baseline: clean `b28f94ac334826c8b69047419c19ca18db764ed7`; Release solution build has zero warnings/errors and all 117 shared tests pass. Browser audit reproduced validation-color precedence, ineffective Elevated, invalid intro margin/mobile padding, nested records-search surfaces, and embedded grid-state framing.

## Current plan and acceptance

- [x] Correct CSS validation precedence, ExperienceCard elevation, logical page spacing, and CardMenu padding customization. Focused browser regressions failed before the fixes and passed afterward (69 affected tests).
- [x] Replace Identity's duplicate action styles, restore shared keyboard-focus treatment, and remove repeated failure titles/messages without changing routes/authentication/POST behavior. Ten actual-render regressions failed before the fixes and pass afterward.
- [x] Add embedded status presentation, integrate it into grid states, and update interactive specimen, catalog, manifest and usage documentation. Standalone defaults, live regions, retry and constrained sizing are covered by five passing browser regressions.
- [x] Correct README button fragments/submit/dismiss examples and Playbook pagination/skip-link recipes. Remove duplicate records-search/grid chrome and compose existing cards in application patterns; preserve semantic grouping and semantic warning/success emphasis. Related worker suite passed 28 tests; the final affected composition rerun passed 16.
- [x] Integrate isolated worker commits. Bump UserInterface from 1.0.38 to 1.0.39 and Identity from 0.9.8 to 0.9.9. Regenerate the component manifest and build-generated CSS; publish the new layout token in the design-token manifest with exact 72-token completeness/default assertions.
- [ ] Run Release solution build, shared tests, full Playbook Playwright suite, and desktop/constrained light/dark/focus/reduced-motion checks. Build at least one consumer in Debug using the reviewed sibling source. Obtain independent review of a frozen commit plus exact delta; resolve required findings before release.
- [ ] Commit/push the library release first. Wait for the exact commit's ci workflow, dispatch release-packages.yaml with only UserInterface and Identity, and verify package publication. Do not update consumer package references before this gate.
- [ ] In isolated consumer checkouts, read each repo's rules, update every relevant Release package reference, retain Debug ProjectReference entries, and increment application versions using repo conventions. Restore/build each consumer sequentially in Release and run affected checks. Coordinate HealthInsight ownership with its active UI chat, preserve dirty checkouts, and commit/push each consumer.
- [ ] Record package versions, immutable commits, CI/publication evidence, consumer results and any actual limitations. Update the older CSS-layer rollout documentation as superseded for future releases, preserving its historical record.

## Ownership and integration

Root owns this plan, integration, Common embedded-status API, Playbook/docs, versioning, release gates and six-consumer rollout. CSS and Identity writers use separate native managed worktrees based on the frozen baseline; they commit only assigned files and do not delegate. Concurrent builds use their isolated output state. Consumers build sequentially because their Debug references share the sibling library outputs.

Reviewers are read-only, receive the base/head commits and dirty/untracked delta, and did not author the reviewed product changes. Shared filesystem and inherited-context limits are disclosed. Source inspection, actual render evidence, executed interactions, local tests, CI and package publication are tracked separately.

## Coordination and release constraints

The user explicitly authorized all audit fixes, source/version releases, and coordination between chats. No additional design approval is needed for this accepted correction scope. HealthInsight's active UI chat and HRASystem's quality chat were notified of planned UserInterface 1.0.39 / Identity 0.9.9 and the publication gate. Several consumer main checkouts contain unrelated dirty work; no broad staging/reset/commit is allowed there. Preserve prior rollout history, but the current source/version release decision supersedes Docker-layer patching.

## Evidence ledger

- Initial audit: Release build passed; 117/117 shared tests passed; no source edits.
- Main managed worktree: `C:/Users/Sutti/.codex/worktrees/component-quality-release/Suttisak.Blazor`.
- Integrated Release build and shared suite: 127/127 passed. A fresh compile reveals the existing unchanged RegistrationPage BL0008 warning; the audit's earlier zero-warning build was incremental.
- CoeKPI restored/built in Debug against a temporary sibling junction to the reviewed library worktree, with unchanged Debug ProjectReference entries. Its existing dependency-audit warnings remain. Consumer worktrees are under `D:/CodexArtifacts/Suttisak-component-quality-20261028/consumers/`; unrelated H: checkouts are untouched.
- Independent initial source review correctly failed the new-token manifest mismatch. Root reproduced the failure and repaired manifest/default/count contracts without removing assertions. Final frozen-delta review follows integrated browser validation.
- HealthInsight chat owns all HealthInsight app changes, references, release 3.2.20 and deployment. It verified direct human authorization for coordination and will wait for package-publication evidence. Remaining app releases will use existing workflow-dispatch release_version conventions after successful official package restore.
- Old default NuGet cache may contain locally recovered packages. Consumer Release verification uses a clean task-specific cache and official NuGet/GitHub sources; no local recovery feed is accepted as publication evidence.
