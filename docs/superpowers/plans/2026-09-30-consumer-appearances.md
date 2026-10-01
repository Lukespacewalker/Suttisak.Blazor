# Consumer appearances implementation plan

**Goal:** Ship Standard, Essential, and Quiet Luxury through the shared UI package, with a persistent selector and Quiet Luxury defaults in HealthInsight and AudiogramIQ.

**Architecture:** The existing early theme bootstrap owns browser preferences and applies `data-appearance` to `html` before first paint. A shared AppearanceSelector composes AppSelect, joins existing preferences/layout slots, and synchronizes every mounted selector. Shared appearance CSS owns neutral surfaces, type, radius, and elevation; each consumer authors its optional muted brand tokens.

**Constraints:** Preserve all unrelated dirty changes. Keep Debug sibling ProjectReferences. No production startup, database reset, or PDF deletion. Build consumers sequentially. User asks to reach a pushable state; do not push consumer changes before the library package is published.

**Acceptance:** All three appearances switch without reload and persist independently of light/dark/system. Invalid or unavailable storage falls back safely. SSR and interactive layouts expose accessible controls, including mobile navigation. Both target apps default to Quiet Luxury for first-time visitors while honoring saved choices. Build shared library and a Debug consumer, run shared tests and Chromium suite, inspect light/dark and narrow/wide renders, obtain independent review, and verify the release target contains only authorized changes.

- [x] Implement and test preference bootstrap, shared selector, and layout integration.
- [x] Promote generic appearance CSS from Playbook, retaining application palettes and gallery-specific rules in Playbook.
- [x] Update component discovery, live examples, consumption documentation, and UI package version.
- [x] Integrate Quiet Luxury defaults and palettes in HealthInsight and AudiogramIQ, preserving current work.
- [x] Complete build, browser, component, consumer, and independent review checks.
- [x] Prepare reviewed library commit and consumer diffs. Library CI and package publication must precede Release reference updates and consumer commits/pushes in all six repositories.

**Coordination:** Root owns shared library, AudiogramIQ, integration, and acceptance. The existing HealthInsight chat performs read-only discovery first; writes and shared-output builds wait for Root's explicit scheduling.

**Verification:** The isolated release checkout excludes unrelated specimen/checkbox work. Release solution build, 77 unit tests, and 279 Chromium tests passed. After the final focus-outline CSS change, the six appearance regression tests passed again. Both target applications built in Debug against the sibling library. UI 1.0.25 packs successfully and contains appearance CSS, bootstrap JS, and isolated styles. An independent reviewer checked frozen source hashes and real AudiogramIQ login geometry at 320/390/1280 px; final verdict PASS. HealthInsight QA uses source-derived static fixtures with mock data, with light/dark and 360/768/1440 px renders, keyboard preferences, privacy accessibility, and contrast checks; it does not execute the application host or clinical workflows.

**Release boundary:** User requested a pushable state. UI 1.0.25 is prepared locally; publication and all consumer Release-reference updates are pending the external release sequence. See [release handoff](../../consumer-appearance-release.md).

## Current follow-up: shared CardMenu correction (2026-10-01)

The previous 1.0.25 release target is superseded by 1.0.26. Earlier verification
and review remain evidence for that earlier snapshot only.

**Outcome:** CardMenu titles and muted subtitles occupy separate rows and wrap
inside narrow containers. Razor owns the content markup so isolated styles
apply. Native link/button behavior and application-owned content remain intact.
Playbook provides editable mock text to inspect the public parameters without
application-layer dependencies.

**Acceptance:** Verify the regression fails before the fix and passes afterward,
long English/Thai content at 320 px, three appearances in light/dark, all three
planned product palettes, keyboard/focus/disabled behavior, reduced motion and
forced colors. Run the Release solution build, shared unit tests, full Playbook
browser suite, a Debug consumer build, and confirm generated discovery metadata.
Publication and consumer Release reference changes remain pending the existing
release sequence.

- [x] Reproduce the title/subtitle geometry defect with a failing browser test.
- [x] Correct shared markup/styles, expose mock text controls, update discovery,
      and bump the UI library version.
- [x] Complete required builds, tests, actual renders, and interaction checks.

**Follow-up evidence:** Release solution build, 77 shared unit tests, and 288
Chromium tests passed. MentalInsight Debug restore/build passed. The new
regression failed before the correction and passed afterward. Twelve
Quiet Luxury rendered contexts covered the three planned palettes, light/dark,
and 320/1440 px; 48 computed-style comparisons matched library-only CSS.
Keyboard, forced-colors focus, and reduced-motion checks passed. Existing
Identity and obsolete Burnout API build warnings remain. This bounded correction
was reviewed by Root; the earlier independent review does not cover it.

## Current outcome: publish 1.0.26 (2026-10-01)

The user authorized publication. GitHub confirms that 1.0.25 already exists;
the current target is 1.0.26. Root reuses the existing isolated release checkout
and keeps unrelated Playbook work out of the release. Consumer verification must
cover the exact release changes while preserving unrelated dirty/staged work.

- [x] Verify the isolated shared release snapshot and its package assets.
- [ ] Commit/push, wait for library CI, then dispatch and confirm publication.
- [ ] Update all six consumers after package availability, restore/build Release
      sequentially, run affected checks, and commit/push only owned release changes.
- [ ] Record workflow/consumer evidence and reconcile the local release changes.
