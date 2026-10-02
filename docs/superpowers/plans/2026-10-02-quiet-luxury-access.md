# Quiet Luxury access and forms

The user approved an Editorial introduction for the right side of login before
implementation. This decision supersedes the large grid/orb showcase in Quiet
Luxury; other appearances and existing application-owned fragments remain valid.

## Outcome and boundaries

- Keep the form primary (55/45 on wide screens) beside a calm introduction.
- Use service/organization identity, a modest heading, short description, and
  optional supporting copy. No library-owned product copy or security claims.
- Reflow the introduction above inputs in constrained parents without cloning
  fragments. Retain one main landmark and visible application-supplied content.
- Keep help/privacy links after the form through existing content/footer slots.
- Refine Quiet Luxury native fields with token radii, visible focus/boundaries,
  lighter labels, and recognizable validation. Keep native behavior and APIs.
- Playbook uses mock copy and owns its presentation containers only. No auth,
  business/application-layer, route, or database changes.

## Current plan and acceptance

1. Refine the shared appearance and main landmark; update existing Playbook
   login/Identity examples, discovery summaries, and usage documentation.
2. Verify library-only consumer fixtures for three palettes in light/dark,
   320/390/1440 px, constrained parents, keyboard, accessibility, validation,
   forced colors, and reduced motion; inspect actual renders.
3. Run the Release solution build, shared tests, complete Playbook suite, and
   a consuming application's Debug project-reference build.
4. Follow the repository release sequence for UI 1.0.27: commit/push, green CI,
   explicit publication, then restore/build and update every Release reference
   in all six consumers. Preserve unrelated primary-workspace changes.

## Evidence

The initial focused browser run reproduced the heavy 780-weight access heading
and missing quiet focus treatment before implementation.

The final V2 Release solution build passed; all 77 shared unit tests and 293
Playbook Chromium tests passed. MentalInsight restored and built in Debug
against the matching sibling source. UI 1.0.27 packs successfully and includes
the updated appearance CSS. Discovery metadata was regenerated from the catalog.

An independent registered reviewer gave PASS for all 12 frozen V2 file hashes
at base `73d00011140c5437d0efafb4765fcfb26b442905`. Actual checks covered Quiet
Luxury light/dark at 1440/320, constrained 520/320 parents, long copy with two
organization rows, keyboard/focus, theme choice, semantic validation, forced
colors, reduced motion, and Standard/Essential regression checks. Library-only
icon input and primary button styles match Playbook exactly. The reviewer had no
maker history and did not edit files, but shared the checkout/server and received
maker observations; review was not blind. Existing Standard Playbook contrast
findings outside this diff remain an optional follow-up.

Publication and consumer evidence is tracked in
[the release ledger](../../consumer-appearance-release.md#quiet-luxury-access-and-forms-1027).

## Acceptance complete (2026-10-02)

UI 1.0.27 source, CI, explicit publication, and all six consumer Release
restore/build/test and package-reference commits are complete. The published
package's repository commit and appearance asset match the reviewed source.
All 11 Release references were verified; Debug ProjectReferences and unrelated
primary-workspace changes were preserved. Publication and consumer commit links
are in [the release ledger](../../consumer-appearance-release.md#quiet-luxury-access-and-forms-1027).
