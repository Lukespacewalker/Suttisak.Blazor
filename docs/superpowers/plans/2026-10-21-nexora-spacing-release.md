# Nexora spacing release

Goal: apply the approved compact working-page spacing to Nexora and release it to AudiogramIQ, BafsWorkout, HealthInsight, CoeKPI, ErgoTrack, and MentalInsight.

Design: shell headings use 12px vertical / 16px horizontal padding on desktop and 8px / 12px in shells at most 48rem wide. Breadcrumb and section spacing use 4px bottom padding; the title body uses 4px top / 8px bottom. AppCard padding interpolates from 12px to 16px using 2cqi of the nearest eligible container, with smaller header/footer separators. Reuse application spacing tokens. Preserve other appearances, control hit areas, table geometry, access pages, and public APIs.

## Current plan and acceptance

- [x] Implement Nexora CSS and bump only UserInterface to 1.0.37. Release solution build and CoeKPI Debug project-reference build passed; 117 shared tests and 454 Playbook browser tests passed. Desktop/mobile light/dark, constrained parents, overflow, focus, heading order, reduced motion and workspace interactions are covered. Fixed two existing test sampling races without relaxing their assertions; the three affected brand tests also passed a final isolated run.
- [x] Review the frozen library delta; release commit `2ddd51832c015ede0b66a7d87ea673deb057bf97` passed [ci](https://github.com/Lukespacewalker/Suttisak.Blazor/actions/runs/39534220159), including 117 shared tests, 454 browser tests and package validation. The exact commit passed [release-packages](https://github.com/Lukespacewalker/Suttisak.Blazor/actions/runs/39535996946), publishing only UserInterface 1.0.37. The restored package CSS SHA-256 matches the reviewed source.
- [x] Update all 11 Release UserInterface references across the six isolated consumer checkouts to 1.0.37, preserving Debug references and dirty user checkouts. Sequential Release restore/build and 1,964 consumer tests passed before the dependency-only commits were pushed. MentalInsight's PostgreSQL-dependent API tests passed on a dedicated disposable local database, which was removed afterward.
- [ ] Deploy after the [production scope decision](#production-scope) below. The original assumption that every production service could use a freshly dispatched master image is superseded by that decision. Verify the deployed CSS, actual spacing, readiness, and protected services after the chosen rollout.

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

## Production scope

The production inventory revealed organization-specific MentalInsight images with monitoring and annual-roster changes absent from master, and HealthInsight instances on different application revisions. The user has been asked to choose between applying only the approved spacing over the exact running images, or deploying the latest master applications including previously committed changes. That choice is still pending; production containers have not been changed.

The CSS-only path is prepared for all ten running Nexora instances using derived images that preserve the exact application binary layers. Preparation verified the live Compose configuration hash, environment parity, immutable original images, and resolved candidate/rollback snapshots differing only in the web image. The helper passed independent source review and nine safeguard tests. All running container identities, images, and start times were unchanged after preparation. Public browser observations confirmed all ten instances request the nonfingerprinted shared Nexora CSS URL.
