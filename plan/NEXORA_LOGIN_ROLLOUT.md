# Nexora login layout rollout

Current decision: 2026-10-09. This extends the shared login presentation used by MentalInsight to every existing login in the consuming applications. It does not supersede the grid action placement decision.

## Outcome and constraints

- AudiogramIQ, BafsWorkout, CoeKPI, ErgoTrack, HealthInsight and MentalInsight use a dedicated app-owned `NexoraLoginLayout` derived from shared `IdentityLayout` on their login route.
- Shared UI owns composition, compact language/theme controls, headings and responsive behavior. Each app retains its brand, image, localized copy and footer.
- Preserve existing authentication, POST form names/fields, external providers, employee login, return URLs and registration policy. Other account pages keep their current layout.
- HRASystem has no authentication or login page and is recorded as not applicable.
- Preserve all unrelated dirty changes. Library release work occurs in an isolated worktree based on published UI 1.0.32 and retains its public header preferences APIs.

## Dependencies and acceptance

- [x] Audit every consumer and save pre-task source/status snapshots.
- [x] Add five app login layouts and apply them only to login routes; migrate MentalInsight's reference composition to the shared structure.
- [x] Publish shared UI 1.0.33 and Identity 0.9.6 with additive login composition, discovery documentation and meaningful unit/browser coverage.
- [x] Build the library and at least one consuming app through the Debug project reference; run shared UI tests and the full Playbook browser suite.
- [x] Check actual login renders/interactions on desktop and narrow screens, light/dark, Thai/English, heading/label relationships, keyboard preferences, primary form visibility, overflow and preserved login methods.
- [x] Run relevant app tests and required repository checks using disposable test state.
- [x] Obtain read-only independent review against exact source hashes and evidence before release; disclose inherited context and isolation limits.
- [x] Push the isolated library change, wait for CI, dispatch publication for only the bumped UI and Identity packages and wait for successful publication.
- [x] Update every Release UI/Identity package reference consistently, preserve Debug references, and restore/build consumers sequentially against the published package before app commits.
- [x] Commit and push the accepted isolated application changes, preserving unrelated primary-checkout work.
- [x] Record exact outcomes and any remaining limitations.

Library writer: `/root/nexora_library`, isolated checkout `C:/Users/Sutti/.codex/worktrees/nexora-login-rollout/Suttisak.Blazor`. Root owns app edits, integration and acceptance. Auditors and reviewers do not edit product code.

Pre-task baseline: `C:/Users/Sutti/AppData/Local/Temp/codex-nexora-login-9c8cfec6259948ad8ea677cfb9c62bb0`.

## Current verification and integration

The shared login is opt-in; recovery, registration and two-factor pages retain their previous layouts. App handlers, form names/fields, provider order and employee sign-in are preserved. CoeKPI's duplicate global passkey script was removed because the shared component already supplies it.

Actual Thai wrong-password submissions exposed the old message-prefix classifier marking Thai errors as success. Identity 0.9.6 adds nullable `StatusMessage.Intent`; Login supplies Error for local failures, while omitted intent retains existing cookie success behavior. Both alternative-access branches compose the shared tile group without changing forms or handlers.

The isolated library passes Release solution build, 113 unit tests and the full 441-case Playbook browser suite. Final affected checks pass for production provider markup, 32 px decorative images and equal-height tiles; Identity explicitly depends on UI 1.0.33. The final source freeze records 25 files, including the provider image's empty alt. One existing RegistrationPage BL0008 warning remains. The 441-case run predates the final scoped provider CSS/alt fixes; affected checks pass afterward and required CI reruns the entire suite before publishing.

Each consumer has an isolated worktree based on its freshly fetched `origin/master`. The consumer worktrees were recovered at `H:/repos/Lukespacewalker/nexora-login-rollout-consumers` after several unregistered checkouts under the Codex worktree directory disappeared during QA. All 28 reviewed source hashes match the recovered files exactly; a separate source backup is preserved with the evidence. Only this task's changes are copied; unrelated pending grid/theme work stays in the primary checkout. Package-reference edits depend on successful library publication.

All six apps' legacy alternative-access CSS is scoped to `.access-page-layout` so it cannot override Nexora's shared tile presentation. MentalInsight's duplicate App-level registration footer is removed; its single header registration link retains `AllowSelfRegistration`.

The final MentalInsight Debug browser suite passes 4/4, including the production image alt assertion and all retained tile, preference and language checks. BafsWorkout's real protected/admin journey, ErgoTrack's two forms and invalid-password checks, and AudiogramIQ/CoeKPI/HealthInsight's disposable-fixture matrices also pass. Final Release matrices/builds against the published package remain pending.

Independent library review passes against 25 exact hashes, package metadata and actual MentalInsight renders. Library commit `9958b4fa14589b77c16a8d248288b85cdff010cf` is pushed to master; CI run `37867877282` passed, including 441 browser tests and NuGet validation. Release run `37870016129` was dispatched for only UI 1.0.33 and Identity 0.9.6; consumer reference updates remain gated on successful publication.

The preceding library acceptance is superseded for provider descriptions. A diagnostic against the exact isolated Debug binaries found unequal tiles in all eight AudiogramIQ states and corporate-account text clipping at 320 px. The release was cancelled before its publication step; GitHub confirms that neither planned version is published. Shared caption composition and a regression specimen are being corrected, retaining the provider help text. A new source freeze, affected render/interaction checks and CI are required before redispatching publication.

The correction is independently accepted against 25 frozen hashes and actual AudiogramIQ renders/interactions. Conditional group-wide subgrid rows preserve captions beneath their providers, override the production gap and handle mixed caption/no-caption providers. Release build and 113 unit tests pass; five focused Playbook cases pass. Actual AudiogramIQ passes all eight stable Debug states, four native validation and four localized wrong-password checks with stable hashes. Follow-up library commit `4b47294cefa7229c8d39df3f2f657f5f2e485c43` is pushed; its required full CI expects 443 Playbook cases. Publication and consumer Release acceptance remain pending.

Final CI `37871928280` passed for `4b47294`, including all 443 Playbook cases and NuGet validation. Final release workflow `37872977428` is running for only UI 1.0.33 and Identity 0.9.6. App references still await successful publication.

## Current release acceptance

The preceding running/pending publication entries are historical. Final release workflow `37872977428` succeeded for exact commit `4b47294cefa7229c8d39df3f2f657f5f2e485c43`, including all 443 browser cases. Both packages are published. Independently downloaded official package hashes match the bytes restored into the normal NuGet cache; every consumer Release assets file selects the expected package versions. Debug project references remain unchanged.

AudiogramIQ passes all six official suites and their coverage gates (192 tests), plus eight actual Release login states and native/invalid-password checks. Its ArchitectureTests DI dependency was minimally aligned from 10.0.11 to 10.0.12 after an actual NU1605 through the published Identity.Core dependency. BafsWorkout passes Application 112, Web 41 and its real protected/admin journey. CoeKPI passes its complete 73-test solution and eight actual Release login states. ErgoTrack passes Unit 222, Integration 77 and both browser width cases. HealthInsight passes Architecture 18, affected Functional 27 and eight actual Release login states. Temporary hosts and databases are disposed.

MentalInsight passes Architecture 37, Client 189, focused identity-policy 10, all 36 ApiV2 render contracts and all 11 affected browser cases, including registration through questionnaire completion. A short landscape failure exposed native focus leaving the lower part of an input outside the viewport. Actual Release diagnostics ruled out overflow and field scroll margins; a login-only root scroll-padding rule makes the whole control visible. Whole-control bounds/hit-test assertions remain unchanged. A later navigation-load timeout had already reached the complete Home page; an unchanged full rerun passed. Failed attempts, traces and screenshots remain archived separately.

Independent rendered review found mobile showcase copy hard to read over the BafsWorkout and ErgoTrack photos. Product-owned mobile-only overlays were added without changing desktop presentation. Both affected Release browser journeys pass again. BafsWorkout captures now fast-forward theme transitions; computed-color artifacts and settled renders confirm enabled controls with correct dark colors. Assertions remain unchanged. The final source freeze contains 42 task files across seven repositories, SHA256 `4D28432FE811C68D97C3AC9E8FB20D42E9003A219569273620117DC3F1C2E12A`. Staged checks exposed extra final blank lines in the five new layout files; their cleanup changes only final newlines, verified against saved source bytes, with all seven staged whitespace checks passing. Existing behavior evidence remains valid.

HRASystem has no implemented authentication/login, so Nexora login acceptance is not applicable. Its floating Identity reference now resolves 0.9.6 and therefore requires UI 1.0.33; retaining UI 1.0.23 fails restore with NU1605. The UI version bump is necessary compatibility work. Final Release restore/build succeed. Its broader Care Editor checks have three existing failures (26/29 pass), reproduced with the old UI 1.0.23 and Identity 0.9.5: missing selection guards and an unpublished search-picker component. These are outside the login rollout and are not claimed as passing or repaired here.

Successful OAuth/passkey authentication is not claimed. Source review preserves provider/passkey handlers and return URLs; executed checks cover their rendered controls, native validation, actual negative password POSTs, successful Bafs admin access and Mental participant registration/access.

## Completed integration

Independent read-only acceptance is PASS for the exact final 42-file freeze, including the bounded final-newline cleanup. The reviewer was not a maker, inherited earlier session context, checked source hashes and actual renders/executed evidence, and disclosed disposable-fixture and external-authentication limits. Record: `C:/Users/Sutti/AppData/Local/Temp/codex-nexora-login-9c8cfec6259948ad8ea677cfb9c62bb0/final-independent-review.md`.

All seven consumer commits are pushed to `origin/master`; only accepted task paths are included. Their isolated worktrees are clean and all frozen source hashes remain unchanged. Original primary checkouts retain unrelated pending work. App CI is not asserted as completed; the required library CI and package-publication workflow both passed.

| Repository | Pushed commit |
| --- | --- |
| Suttisak.Blazor | `4b47294cefa7229c8d39df3f2f657f5f2e485c43` |
| AudiogramIQ | `4a78c356b8d05f0de4d1d8cf297eaf92bd5a306a` |
| BafsWorkout | `210051f729badaac005ac63e6c2d4c42c4abe5d2` |
| CoeKPI | `f20ec6200306ca33e01c6f250badd635cc947a3d` |
| ErgoTrack | `d87588df54e36b2ee80636d855efc0075147523c` |
| HealthInsight | `0878a1e088006bdbc089434a183c432998ab0e80` |
| MentalInsight | `e66e0e06b62a0e02422713134d079e5ff3789820` |
| HRASystem | `579f2eaa4cb8fe70aa28459f0aa6fc996a3f3097` |
