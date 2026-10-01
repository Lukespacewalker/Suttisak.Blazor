# UI 1.0.26 appearance release handoff

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
- [ ] Commit/push the library release and wait for `ci` success.
- [ ] Dispatch publication for UI 1.0.26 only and confirm package availability.
- [ ] Restore/build and commit/push every consumer's Release package references,
      including the previously prepared HealthInsight/AudiogramIQ theme changes.

The isolated checkout passed the Release solution build, all 77 shared unit
tests, and all 285 Chromium tests (the three unrelated brand-control tests from
the primary workspace are excluded). UI 1.0.26 packs successfully; the package
contains appearance CSS, theme bootstrap, and scoped CardMenu content/subtitle
styles. The earlier MentalInsight Debug build exercises the same shared component
source. Existing Identity `BL0008` remains outside this correction.

## Remaining release sequence

The repository [agent guide](../AGENTS.md) requires publication before consumers change Release PackageReferences or commit/push the update. Version 1.0.25 is available; 1.0.26 publication is pending this follow-up.

1. Push the prepared library commit and wait for its `ci` workflow to pass.
2. Dispatch and watch publication for the bumped package only:

   ```powershell
   gh workflow run release-packages.yaml -f tag=<full-release-commit-sha> -f package_ids="Suttisak.Blazor.UserInterface"
   gh run watch <release-workflow-run-id> --exit-status
   ```

3. After successful publication, search each repository for every `Suttisak.Blazor.UserInterface` Release PackageReference and set all of them to 1.0.26: AudiogramIQ, BafsWorkout, HealthInsight, CoeKPI, ErgoTrack, MentalInsight. Keep Debug ProjectReferences unchanged.
4. Restore then build each consumer in Release sequentially, with matching configuration. Include only the theme files and package-reference hunks owned by this release; preserve unrelated dirty changes, including existing AudiogramIQ import work and HealthInsight Titmus work.
5. Commit and push the verified consumer updates. Only HealthInsight and AudiogramIQ change their default appearance; the other four receive the package update.

Consumer Release builds remain pending publication; Debug validation does not prove package restoration. Do not push consumers with their current older package references: those packages lack the new appearance asset and selector.
