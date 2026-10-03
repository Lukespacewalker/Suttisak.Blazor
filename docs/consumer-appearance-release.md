# Consumer appearance release handoff

## Nexora surfaces and access: 1.0.28 (prepared locally)

### Header preference revision (2026-10-03)

The current header decision supersedes the earlier default placement of
AppearanceSelector in shared preferences and MainLayout. Shared HeaderControl,
HeaderControlWithUser, Identity preferences, and MainLayout now expose language
and Light/Dark/System buttons without appearance dropdowns in either desktop or
mobile surfaces. Playbook's application-shell example follows the same contract.
The public standalone AppearanceSelector, saved settings, and bootstrap/browser
API remain compatible. The Playbook exposes the standalone setting outside the
header and retains its explicit catalog preview chooser.

UI remains 1.0.28 because this version has not been published. The cancelled
publication target at `88202ad` and its package below are superseded by this
revision. The verification below records that earlier snapshot; it does not
verify this later change. Root owns integration, independent review, and the new
CI/publication target.

Current revision verification:

- Release solution build passed with zero warnings and errors. All 80 UI unit
  tests passed, including rendered anonymous/authenticated header contracts.
- All 11 final focused browser tests passed. They exercise HeaderControl and
  HeaderControlWithUser at 1440 and 320 px, opened MainLayout mobile navigation,
  keyboard disclosure, language redirects, saved mode/appearance compatibility,
  standalone appearance settings, and identity preference accessibility.
- The earlier affected browser run passed 84 tests and failed six changed
  fixture checks. Corrections removed a test-only repeated preference seed and
  pinned preview mode, waited for real color transitions before axe sampling,
  and used the isolated HeaderControl specimen to avoid the documentation page's
  unrelated long heading. The final focused run supersedes those six failures;
  no product CSS was changed to accommodate them. The full suite will run in CI.
- Commands, completed output, and four header captures are retained under
  `C:/Users/Sutti/.codex/artifacts/nexora-library-20261003/header-*`; the exact
  local record is `header-verification-record.md` in that artifact directory.

The current Nexora contract is documented in
[the UI setup guide](../Suttisak.Blazor.UserInterface/README.md#nexora-surfaces-and-access-1028).
Nexora adds ivory/white and charcoal surfaces, restrained shadows, rectangular
cards, and a desktop introduction/photo panel beside the form. Constrained
parents place the form first. Existing Standard, Essential, and Quiet Luxury
remain selectable. Application copy, logos, photographs, routes, and account
behavior remain application-owned.

Hosts may set `--app-nexora-accent` and `--app-nexora-on-accent`, plus the optional
soft, border, and highlight tokens. Shared Nexora defaults to warm gold; a
consumer may choose copper, teal, or another accessible palette. Executed browser
checks apply a teal override in both modes and verify the primary action, active
navigation, focus outline, and selection. The opt-in `data-default-theme="light"`
bootstrap retains saved Light, Dark, and System preferences; consumers without
that attribute retain their existing default.

The isolated source is based on `999ce3f99ccc6133cb71d3e2573979ac489b1dbc`.
Earlier product and browser-test changes were frozen at
`2d171597201506a7fef84d6a71bd4a012f41d138`. Local executed verification:

- Release solution build passed with zero errors and the existing Identity
  `BL0008` warning. All 77 shared unit tests passed.
- The full Playbook Chromium suite passed all 307 tests at `61fbb38`. After the
  final contrast fixes, all 28 affected browser tests passed, including six new
  checkbox/radio and placeholder checks. The final full suite was not repeated.
- The new checks reproduced unchecked boundaries below 3:1 and dark placeholder
  text below 4.5:1 before their fixes. Normal/hovered checkbox and radio boundaries
  now meet 3:1 against both adjacent surfaces; placeholder text meets 4.5:1.
  Scoped host error borders, keyboard selection, pristine required fields,
  invalid-submit focus, forced colors, and reduced motion were exercised.
- UI 1.0.28 packs successfully. Its static assets include `nexora.css`, the
  importing appearance entry, theme bootstrap, and theme module. No package was
  published by this preparation work.

Actual screenshots cover light/dark shell desktop and mobile navigation, login
at 1440/390/320 px, and the shared photo slot inside a 320 px parent. Captures and
test output are in
`C:/Users/Sutti/.codex/artifacts/nexora-library-20261003/acceptance` and
`C:/Users/Sutti/.codex/artifacts/nexora-library-20261003/review-fixes`.
The Playbook uses demo interactions; production authentication is not exercised
by these library tests. Root owns consumer integration, acceptance, and the
publication sequence in [the repository guide](../AGENTS.md).

The published 1.0.26 and 1.0.27 records below are historical evidence for those
snapshots. Their publication status does not imply publication of 1.0.28.

## Historical UI 1.0.26 handoff

Standard, Essential, and Quiet Luxury are selectable through the shared browser preferences. Appearance remains independent of light/dark/system and persists per origin. Hosts load `appearance.css` after application/isolated styles; see [setup and API](../Suttisak.Blazor.UserInterface/README.md#appearance).

HealthInsight and AudiogramIQ source now defaults first-time visitors to Quiet Luxury while honoring saved choices. Their optional muted-brand tokens retain blue-teal and teal identity. HealthInsight Viewer uses semantic surfaces and foregrounds, exposes shared preferences, and preserves red abnormal-result semantics in dark mode. PDF and interpretation behavior are unchanged.

## Previous prepared snapshot: 1.0.25

The evidence below describes the earlier 1.0.25 snapshot. The current source
targets 1.0.26 with the shared CardMenu layout correction; the earlier frozen
review and package validation do not cover that correction.
Version 1.0.25 was subsequently published successfully by
[release run 36682901075](https://github.com/Lukespacewalker/Suttisak.Blazor/actions/runs/36682901075).

- Isolated shared release checkout: Release build, 77 unit tests, 279 Chromium tests passed; the six appearance tests were rerun after the final focus CSS change.
- Both consumers: Debug restore/build using the existing sibling ProjectReferences passed.
- NuGet: UI 1.0.25 pack passed and includes appearance CSS, bootstrap, and isolated component styles.
- Independent shared review: PASS; real AudiogramIQ login checked at 320/390/1280 px. HealthInsight source-derived fixture QA covers light/dark, 360/768/1440 px, persistence, keyboard, privacy accessibility, and contrast. HealthInsight host and clinical workflows were not executed.

## Current source verification: 1.0.26

This is historical 1.0.26 evidence. The current decision and completed release are
[Quiet Luxury access and forms 1.0.27](#quiet-luxury-access-and-forms-1027).

The shared CardMenu now stacks its title and muted subtitle, applies isolated
styles through Razor markup, and wraps long English/Thai text in narrow parents.
Playbook adds editable mock text controls without application-layer dependencies.

- Release solution build passed with one existing Identity `BL0008` warning.
- All 77 shared unit tests and 288 Playbook Chromium tests passed.
- The new layout regression reproduced the original defect before the fix, then
  passed across Standard, Essential, and Quiet Luxury in light/dark at 320/1440 px.
- Actual Quiet Luxury renders and keyboard interactions were checked for
  MentalInsight, HealthInsight, and AudiogramIQ palettes. Twelve rendered contexts
  matched library-only CSS in 48 style comparisons; forced-colors focus and
  reduced-motion checks passed.
- MentalInsight Debug restore/build passed against the sibling library, with
  existing Identity and obsolete Burnout API warnings. The application host and
  clinical workflows were not executed.
- Catalog and generated manifest describe the updated CardMenu contract.

This correction was implemented and reviewed locally by Root. The earlier
independent review applies to 1.0.25. Version 1.0.26 is now being prepared in the
existing isolated release checkout; its frozen release verification is recorded
below as it completes.

## Publication follow-up (2026-10-01)

The user authorized publication of 1.0.26. The release checkout includes the
shared CardMenu correction, editable mock text controls, generated discovery
metadata, and Quiet Luxury Playbook presentation refinements. Existing native
checkbox specimens and unrelated workbench changes remain outside this release.

- [x] Verify the isolated release build, unit/browser tests, and NuGet package.
- [x] Commit/push the library release and wait for `ci` success.
- [x] Dispatch publication for UI 1.0.26 only and confirm package availability.
- [x] Restore/build and commit/push every consumer's Release package references,
      including the previously prepared HealthInsight/AudiogramIQ theme changes.

The isolated checkout passed the Release solution build, all 77 shared unit
tests, and all 285 Chromium tests (the three unrelated brand-control tests from
the primary workspace are excluded). UI 1.0.26 packs successfully; the package
contains appearance CSS, theme bootstrap, and scoped CardMenu content/subtitle
styles. The earlier MentalInsight Debug build exercises the same shared component
source. Existing Identity `BL0008` remains outside this correction.

Library release commit:
[`64239dc2e9e348f7c45e0b2205d38fbd0e157c2e`](https://github.com/Lukespacewalker/Suttisak.Blazor/commit/64239dc2e9e348f7c45e0b2205d38fbd0e157c2e).
[CI run 36808802643](https://github.com/Lukespacewalker/Suttisak.Blazor/actions/runs/36808802643)
passed, including 285 Chromium tests and NuGet package validation. Publication
was dispatched for the UI package only through
[release run 36809937125](https://github.com/Lukespacewalker/Suttisak.Blazor/actions/runs/36809937125).

## Publication and consumer evidence

Release run 36809937125 passed, including 77 shared unit tests and 285 Chromium
tests. GitHub Packages exposes UI 1.0.26 (version ID 1319509470). The downloaded
package's NuSpec repository commit is `64239dc2e9e348f7c45e0b2205d38fbd0e157c2e`.

All six consumers restored and built in Release using the published package.
Their 11 UI PackageReferences are 1.0.26; Debug ProjectReferences are unchanged.
The committed Release assets were checked for package entries rather than sibling
project entries. The following consumer checks passed before commit/push:

| Consumer | Published commit | Verification |
| --- | --- | --- |
| AudiogramIQ | [b032634](https://github.com/Lukespacewalker/AudiogramIQ/commit/b0326340398c677fffd35726fcbbf45df079e193) | Release build; 21 presentation and 11 architecture tests |
| BafsWorkout | [7623fcb](https://github.com/Lukespacewalker/BafsWorkout/commit/7623fcb6fc501b4e7643da575afa80677f73c4d0) | Release build; 41 web and 23 client tests |
| HealthInsight | [082f1bb1](https://github.com/Lukespacewalker/HealthInsight/commit/082f1bb1592af2faf4b00cb3bae6fe185819cac3) | Release build; 18 architecture and 7 summary render tests |
| CoeKPI | [fec3e1f](https://github.com/Lukespacewalker/CoeKPI/commit/fec3e1f5b499ba407406ee9c7f75c139f5c33d5a) | Release solution build; all 73 solution tests, including disposable PostgreSQL integration |
| ErgoTrack | [e6530e6](https://github.com/Lukespacewalker/ErgoTrack/commit/e6530e6526a9349b72580524036f80cef9d953fd) | Release build; 24 component, 222 unit, 32 architecture, and 77 integration tests |
| MentalInsight | [1c9b3d9](https://github.com/Lukespacewalker/MentalInsight/commit/1c9b3d9036635f41927bc280984da1f80afb0084) | Release build; 60 client and 36 architecture tests |

ErgoTrack's initial integration run selected the first native select, which now
belongs to appearance preferences. Its test now targets `name="Input.CompanyId"`
and checks the persisted company options within that field. No registration or
authorization implementation changed; all 77 integration tests passed afterward.

Release commits used clean existing checkouts to preserve unrelated work.
AudiogramIQ and HealthInsight primary checkouts retain their dirty/staged work
and have matching UI package references. The primary library checkout also
retains unrelated Playbook work and its earlier branch position. Package builds
and consumer checks above cover the published snapshots, not those unrelated
dirty deltas. Existing compiler warnings were retained. Consumer application
image publication was not dispatched by this package release.

## Release sequence (completed)

The repository [agent guide](../AGENTS.md) requires publication before consumers change Release PackageReferences or commit/push the update. All steps below are completed for 1.0.26; the evidence above supersedes the earlier pending-publication status.

1. Push the prepared library commit and wait for its `ci` workflow to pass.
2. Dispatch and watch publication for the bumped package only:

   ```powershell
   gh workflow run release-packages.yaml -f tag=<full-release-commit-sha> -f package_ids="Suttisak.Blazor.UserInterface"
   gh run watch <release-workflow-run-id> --exit-status
   ```

3. After successful publication, search each repository for every `Suttisak.Blazor.UserInterface` Release PackageReference and set all of them to 1.0.26: AudiogramIQ, BafsWorkout, HealthInsight, CoeKPI, ErgoTrack, MentalInsight. Keep Debug ProjectReferences unchanged.
4. Restore then build each consumer in Release sequentially, with matching configuration. Include only the theme files and package-reference hunks owned by this release; preserve unrelated dirty changes, including existing AudiogramIQ import work and HealthInsight Titmus work.
5. Commit and push the verified consumer updates. Only HealthInsight and AudiogramIQ change their default appearance; the other four receive the package update.

Consumer Release builds now verify the package-reference path after publication.

## Quiet Luxury access and forms: 1.0.27

This records the 1.0.27 Quiet Luxury access/form decision and supersedes the earlier grid/orb
Quiet Luxury login presentation. The approved scope and acceptance are recorded
in [the current plan](superpowers/plans/2026-10-02-quiet-luxury-access.md).
Applications retain their copy, organization assets, routes, and behavior through
the existing fragments. Playbook uses mock content and stays independent of
application/business layers.

- The shared access layout gives the form 55% of the desktop frame beside a
  calm Editorial introduction. Constrained parents place the compact introduction
  above inputs without duplicating fragments, including long organization text.
- Quiet Luxury native fields use token corners, readable boundaries, lighter
  labels, visible focus, and existing semantic validation states.
- Playbook's legacy raw-input styles no longer repaint the shared icon input.
  Computed styles for both the input and primary button match library-only CSS.
- Final isolated Release build, all 77 shared unit tests, and all 293 Playbook
  Chromium tests passed. MentalInsight Debug restore/build passed against the
  matching sibling source; UI 1.0.27 pack and static appearance asset checks passed.
- Actual renders covered MentalInsight, HealthInsight, and AudiogramIQ palettes
  in light/dark at 1440/320, alongside constrained parents and form/focus states.

Independent review: PASS against base
`73d00011140c5437d0efafb4765fcfb26b442905` plus 12 exact SHA-256 file hashes.
The reviewer used a fresh registered session without maker history and made no
product/test/config edits. The checkout and local server were shared, and Root
supplied observations, so review was not blind. Actual keyboard, theme choice,
validation, forced-colors, reduced-motion, and Standard/Essential regressions
were checked. Optional existing Standard Playbook chrome/inactive-control
contrast findings outside this diff remain; Quiet Luxury and Essential were clean.

Source release:
[`6f82291c590246581a36f13019099d74461915ad`](https://github.com/Lukespacewalker/Suttisak.Blazor/commit/6f82291c590246581a36f13019099d74461915ad).
[CI 36997568011](https://github.com/Lukespacewalker/Suttisak.Blazor/actions/runs/36997568011)
passed the Release build, 77 shared tests, and NuGet validation. Chromium reported
292 passed plus one existing grid overscan test that passed on retry. The eight
Quiet Luxury access tests passed; grid source and its test were unchanged.

UI-only publication passed in
[release 36999142685](https://github.com/Lukespacewalker/Suttisak.Blazor/actions/runs/36999142685),
including 77 shared tests and all 293 Chromium tests without retries. GitHub
Packages exposes UI 1.0.27 (version ID 1326620444). The downloaded package's NuSpec
repository commit is `6f82291c590246581a36f13019099d74461915ad`; its appearance
asset matches the reviewed source.

All six consumers restored and built against the published Release package before
commit/push. All 11 UI PackageReferences are 1.0.27, and their Release asset entries
use the package. Each consumer commit changes only package versions; Debug
ProjectReferences are unchanged.

| Consumer | Published commit | Verification |
| --- | --- | --- |
| AudiogramIQ | [034ed2a](https://github.com/Lukespacewalker/AudiogramIQ/commit/034ed2a043aaa68cb239ef8325f113fe7d8ffcb1) | Release build; 21 presentation and 11 architecture tests |
| BafsWorkout | [4b611aa](https://github.com/Lukespacewalker/BafsWorkout/commit/4b611aa76cfa2405df649e6ba8e267d47a5d4eae) | Release build; 41 web and 23 client tests |
| HealthInsight | [a6b8fe4](https://github.com/Lukespacewalker/HealthInsight/commit/a6b8fe4128a90123ac7515160cddab7475d85452) | Release build; 18 architecture and 8 summary render tests |
| CoeKPI | [94b9b4f](https://github.com/Lukespacewalker/CoeKPI/commit/94b9b4ff61fb2a0a7506e256fdc5970599bc58eb) | Release solution build; all 73 solution tests, including disposable PostgreSQL integration |
| ErgoTrack | [d41eb77](https://github.com/Lukespacewalker/ErgoTrack/commit/d41eb77696b795f22c2d2cd692fe0bc19b27cf86) | Release build; 24 component, 222 unit, 32 architecture, and 77 integration tests |
| MentalInsight | [91b7bb7](https://github.com/Lukespacewalker/MentalInsight/commit/91b7bb7e7da2d4a98781a1b6432c60384aaf5ae6) | Release build; 84 client and 36 architecture tests |

Existing checkouts were reused. HealthInsight's release checkout first integrated
its already-published upstream changes; those changes are not part of this
package-update commit. Primary package references were synchronized while
preserving dirty AudiogramIQ/HealthInsight work. The primary library retains
unrelated Playbook work and its earlier branch position; published verification
covers the isolated source snapshot. Existing compiler warnings remain.
Runtime consumer deployment is outside this package update.

Acceptance and the required package release sequence are complete for UI 1.0.27.
