# Suttisak.Blazor agent guide

## Releasing `Suttisak.Blazor.UserInterface`

When changing the reusable UI library, follow this sequence:

1. Read `Suttisak.Blazor.UserInterface/AGENTS.md` and follow its component and verification rules.
2. Bump `AssemblyVersion` in `Suttisak.Blazor.UserInterface/Suttisak.Blazor.UserInterface.csproj`. `FileVersion` and NuGet `Version` intentionally inherit that value.
3. Build the library and at least one consuming application using its Debug project reference.
4. Commit and push the library release to `Suttisak.Blazor` first. The GitHub Actions workflow publishes the package.
5. Once the package is available, update every Release `PackageReference` for `Suttisak.Blazor.UserInterface` in these five consuming repositories, then commit and push each repository:
   - `AudiogramIQ`
   - `OccMedCheckUpBlazor`
   - `CoeKPI`
   - `ROSA-Questionnaire`
   - `Survey-Ajinomoto`

Do not change their Debug `ProjectReference` entries; they intentionally use the sibling source project during local development. Before committing an app, search the repository for `Suttisak.Blazor.UserInterface` so every Release package reference in that app receives the same version.
