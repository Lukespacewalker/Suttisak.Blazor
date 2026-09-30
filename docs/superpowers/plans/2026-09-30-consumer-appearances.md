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
