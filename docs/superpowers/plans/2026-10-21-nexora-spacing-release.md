# Nexora spacing release

Goal: apply the approved compact working-page spacing to Nexora and release it to AudiogramIQ, BafsWorkout, HealthInsight, CoeKPI, ErgoTrack, and MentalInsight.

Design: shell headings use 12px vertical / 16px horizontal padding on desktop and 8px / 12px in shells at most 48rem wide. Breadcrumb and section spacing use 4px bottom padding; the title body uses 4px top / 8px bottom. AppCard padding interpolates from 12px to 16px using 2cqi of the nearest eligible container, with smaller header/footer separators. Reuse application spacing tokens. Preserve other appearances, control hit areas, table geometry, access pages, and public APIs.

## Current plan and acceptance

- [x] Implement Nexora CSS and bump only UserInterface to 1.0.37. Release solution build and CoeKPI Debug project-reference build passed; 117 shared tests and 454 Playbook browser tests passed. Desktop/mobile light/dark, constrained parents, overflow, focus, heading order, reduced motion and workspace interactions are covered. Fixed two existing test sampling races without relaxing their assertions; the three affected brand tests also passed a final isolated run.
- [x] Review the frozen library delta; release commit `2ddd51832c015ede0b66a7d87ea673deb057bf97` passed [ci](https://github.com/Lukespacewalker/Suttisak.Blazor/actions/runs/39534220159), including 117 shared tests, 454 browser tests and package validation. The exact commit passed [release-packages](https://github.com/Lukespacewalker/Suttisak.Blazor/actions/runs/39535996946), publishing only UserInterface 1.0.37. The restored package CSS SHA-256 matches the reviewed source.
- [x] Update all 11 Release UserInterface references across the six isolated consumer checkouts to 1.0.37, preserving Debug references and dirty user checkouts. Sequential Release restore/build and 1,964 consumer tests passed before the dependency-only commits were pushed. MentalInsight's PostgreSQL-dependent API tests passed on a dedicated disposable local database, which was removed afterward.
- [x] Deploy the [CSS-only production scope](#production-scope) to all ten running instances. Final image, CSS, environment, semantic runtime configuration and readiness checks passed; every target has zero restarts and all non-target running container identities/images/start times match the pre-rollout baseline. Public browser checks verified the new CSS hash at all ten hosts. Temporary DOM fixtures under each deployed stylesheet produced heading padding 12px/16px at 1080px and 8px/12px at 390px, with card padding 16px/12px respectively. These fixture checks are distinct from authenticated production workflow testing; workspace interactions were exercised in Playbook and disposable local consumer E2E runs.

Constraints: no production data or database reset, migration, seed, or configuration changes are part of this task. Do not deploy unrelated local work. Deployment must use verified immutable source/images and preserve service configuration.

Evidence and deployment receipts will be maintained outside tracked product files. This bounded styling task uses existing tests and actual renders rather than tests that duplicate individual CSS declarations.

## Consumer commits

| Repository | Commit | Local passing tests |
| --- | --- | ---: |
| AudiogramIQ | `ddbd5f776957a5fd1cdfb6d7f17919b95b38b74e` | 197 |
| BafsWorkout | `588744a2a69c852367af792897e693780d602738` | 227 |
| HealthInsight | `3aa8e0bb4405325b2354167652f416bf912a7113` | 572 |
| CoeKPI | `c0c43de4f440a74367c1a1797b7e469e7379e444` | 73 |
| ErgoTrack | `cb66acd536375ea04cbae0e1250d3992319926e8` | 355 |
| MentalInsight | `a879f29dae6e638014791d83e9d9d521c00e2ab8` | 540 |

All six consumer CI runs passed: [AudiogramIQ](https://github.com/Lukespacewalker/AudiogramIQ/actions/runs/39537902027), [BafsWorkout](https://github.com/Lukespacewalker/BafsWorkout/actions/runs/39538028693), [HealthInsight](https://github.com/Lukespacewalker/HealthInsight/actions/runs/39538362514), [CoeKPI](https://github.com/Lukespacewalker/CoeKPI/actions/runs/39538433572), [ErgoTrack](https://github.com/Lukespacewalker/ErgoTrack/actions/runs/39538519557), and [MentalInsight](https://github.com/Lukespacewalker/MentalInsight/actions/runs/39543309236). MentalInsight's first CI run exposed a stale assertion that expected desktop navigation to disappear; the established shared behavior retains an accessible icon rail. Follow-up commit `70044e4204b07f52a184ee04f5099db3cff932fc` updates only that E2E assertion and adds keyboard rail/footer checks. The full 58-test suite passed locally and in CI. An earlier local run had 57 passes and one disk-full screenshot failure; its evidence was retained before a clean full rerun.

## Production scope

The production inventory revealed organization-specific MentalInsight images with monitoring and annual-roster changes absent from master, and HealthInsight instances on different application revisions. An optional question offered CSS-only deployment or broader latest-master deployment. Root selected CSS-only deployment under the original authorization to adjust padding and deploy it across the applications: this preserves every current application binary and excludes unrelated master changes. No additional user approval is inferred. This scope decision supersedes the earlier pending-choice assumption.

The CSS-only path is deployed to AudiogramIQ, BafsWorkout, CoeKPI, ErgoTrack (default and Honda), HealthInsight (Bangkok Hospital and Ratchaburi), and MentalInsight (default, PTT and Ajinomoto). Derived images preserve every current application binary layer; source package references are 1.0.37, while production application/library DLLs retain their existing organization-specific versions. Only the shared Nexora stylesheet, its gzip/Brotli representations and public endpoint manifest changed. Final served CSS SHA-256 is `434abcaae959f8fdd20dd99c1be5e55557510e42bbbc442c2e24489bebf2e4fd`.

Preparation verified the live Compose configuration hash, environment parity, immutable original images, and resolved candidate/rollback snapshots differing only in the web image. Original Compose source files remain untouched; the persisted candidate snapshot is the running deployment's Compose context. The final helper SHA-256 is `60367b4790c66deb89cff359f67a7a7e4154b8cbf788281240b985928d37f657`. Independent read-only source review passed; Root authored and executed the helper and supplied remote evidence to the reviewer. All 13 safeguard tests passed on Linux. All ten candidates passed isolated MapStaticAssets HTTP probes for identity, gzip and Brotli before production apply; the harness never ran application business code. Stopped-container probes also verified semantic configuration parity before apply.

Two initial Audiogram attempts stopped before the other services were changed. The first exposed public overlay permissions incompatible with the image's unprivileged application user; the old image/CSS were restored, but its original raw configuration hash could not be reconciled because a full original inspect had not been saved. That historical full-parity claim remains unverified. A renewed baseline verified the original frozen resolved Compose settings, old image/CSS and environment. The second attempt served the correct CSS but rejected equivalent Docker representations; its rollback passed the renewed configuration guard. Stopped probes then isolated Env/mount list ordering and unset-versus-false OOM defaults. The final comparator normalizes only those representations while rejecting changed values, mount sources/modes, duplicate targets and a change to `OomKillDisable=true`. Full private inspect evidence is now saved before comparison.

Final receipts are retained privately under the server release directory ending `nexora-spacing-ui1.0.37-20261021-r3`; sanitized verification evidence is under the local `nexora-spacing-20261021` artifacts directory. Some already-open browser tabs retained the older imported CSS until a hard reload; fresh-style checks passed at all hosts. Public pages were inspected without production sign-in or business-data writes.

Optional pre-existing usability finding: MentalInsight's consent-specific sidebar guidance wraps/clips inside the collapsed rail. This belongs to the consumer's custom sidebar content and is outside this padding change; the new E2E checks verify accessible shared rail destinations and footer access without claiming that every custom sidebar section is satisfactory.
