# UI 1.0.25 appearance release handoff

Standard, Essential, and Quiet Luxury are selectable through the shared browser preferences. Appearance remains independent of light/dark/system and persists per origin. Hosts load `appearance.css` after application/isolated styles; see [setup and API](../Suttisak.Blazor.UserInterface/README.md#appearance).

HealthInsight and AudiogramIQ source now defaults first-time visitors to Quiet Luxury while honoring saved choices. Their optional muted-brand tokens retain blue-teal and teal identity. HealthInsight Viewer uses semantic surfaces and foregrounds, exposes shared preferences, and preserves red abnormal-result semantics in dark mode. PDF and interpretation behavior are unchanged.

## Prepared evidence

- Isolated shared release checkout: Release build, 77 unit tests, 279 Chromium tests passed; the six appearance tests were rerun after the final focus CSS change.
- Both consumers: Debug restore/build using the existing sibling ProjectReferences passed.
- NuGet: UI 1.0.25 pack passed and includes appearance CSS, bootstrap, and isolated component styles.
- Independent shared review: PASS; real AudiogramIQ login checked at 320/390/1280 px. HealthInsight source-derived fixture QA covers light/dark, 360/768/1440 px, persistence, keyboard, privacy accessibility, and contrast. HealthInsight host and clinical workflows were not executed.

## Remaining release sequence

The repository [agent guide](../AGENTS.md) requires publication before consumers change Release PackageReferences or commit/push the update. No package has been published by this task yet.

1. Push the prepared library commit and wait for its `ci` workflow to pass.
2. Dispatch and watch publication for the bumped package only:

   ```powershell
   gh workflow run release-packages.yaml -f tag=<full-release-commit-sha> -f package_ids="Suttisak.Blazor.UserInterface"
   gh run watch <release-workflow-run-id> --exit-status
   ```

3. After successful publication, search each repository for every `Suttisak.Blazor.UserInterface` Release PackageReference and set all of them to 1.0.25: AudiogramIQ, BafsWorkout, HealthInsight, CoeKPI, ErgoTrack, MentalInsight. Keep Debug ProjectReferences unchanged.
4. Restore then build each consumer in Release sequentially, with matching configuration. Include only the theme files and package-reference hunks owned by this release; preserve unrelated dirty changes, including existing AudiogramIQ import work and HealthInsight Titmus work.
5. Commit and push the verified consumer updates. Only HealthInsight and AudiogramIQ change their default appearance; the other four receive the package update.

Consumer Release builds remain pending publication; Debug validation does not prove package restoration. Do not push consumers with their current older package references: those packages lack the new appearance asset and selector.
