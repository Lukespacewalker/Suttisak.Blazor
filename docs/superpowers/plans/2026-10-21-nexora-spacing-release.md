# Nexora spacing release

Goal: apply the approved compact working-page spacing to Nexora and release it to AudiogramIQ, BafsWorkout, HealthInsight, CoeKPI, ErgoTrack, and MentalInsight.

Design: shell headings use 12px vertical / 16px horizontal padding on desktop and 8px / 12px in shells at most 48rem wide. Breadcrumb and section spacing use 4px bottom padding; the title body uses 4px top / 8px bottom. AppCard padding interpolates from 12px to 16px using 2cqi of the nearest eligible container, with smaller header/footer separators. Reuse application spacing tokens. Preserve other appearances, control hit areas, table geometry, access pages, and public APIs.

## Current plan and acceptance

- [x] Implement Nexora CSS and bump only UserInterface to 1.0.37. Release solution build and CoeKPI Debug project-reference build passed; 117 shared tests and 454 Playbook browser tests passed. Desktop/mobile light/dark, constrained parents, overflow, focus, heading order, reduced motion and workspace interactions are covered. Fixed two existing test sampling races without relaxing their assertions; the three affected brand tests also passed a final isolated run.
- [ ] Review the frozen library delta; commit/push, wait for ci including package validation, dispatch release-packages.yaml for the exact commit and only Suttisak.Blazor.UserInterface, and confirm publication.
- [ ] In isolated consumer checkouts based on current origin/master, update every Release UserInterface reference to 1.0.37. Preserve dirty user checkouts and Debug references. Restore/build consumers sequentially in Release, run affected required checks, commit/push each dependency-only delta.
- [ ] Dispatch each existing image-release workflow with a fresh release version. Inspect the established deployment path, update only authorized application images, and verify the deployed revision and public static Nexora CSS. Report any actual blocker separately from completed publication/build steps.

Constraints: no production data or database reset, migration, seed, or configuration changes are part of this task. Do not deploy unrelated local work. Deployment must use verified immutable source/images and preserve service configuration.

Evidence and deployment receipts will be maintained outside tracked product files. This bounded styling task uses existing tests and actual renders rather than tests that duplicate individual CSS declarations.
