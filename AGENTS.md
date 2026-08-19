# Suttisak.Blazor agent guide

## Releasing `Suttisak.Blazor.UserInterface`

When changing the reusable UI library, follow this sequence:

1. Read `Suttisak.Blazor.UserInterface/AGENTS.md` and follow its component and verification rules.
2. Bump `AssemblyVersion` in `Suttisak.Blazor.UserInterface/Suttisak.Blazor.UserInterface.csproj`. `FileVersion` and NuGet `Version` intentionally inherit that value.
3. Build the library and at least one consuming application using its Debug project reference.
4. Commit and push the library release to `Suttisak.Blazor` first. The GitHub Actions workflow publishes the package.
5. Once the package is available, update every Release `PackageReference` for `Suttisak.Blazor.UserInterface` in these six consuming repositories, then commit and push each repository:
   - `AudiogramIQ`
   - `BafsWorkout`
   - `HealthInsight`
   - `CoeKPI`
   - `ErgoTrack`
   - `MentalInsight`

Do not change their Debug `ProjectReference` entries; they intentionally use the sibling source project during local development. Before committing an app, search the repository for `Suttisak.Blazor.UserInterface` so every Release package reference in that app receives the same version.

## Building consuming applications across configurations

The consuming applications select sibling `ProjectReference` entries in Debug and NuGet `PackageReference` entries in Release. NuGet restore output is configuration-specific. After switching between Debug and Release, do not immediately build with `--no-restore`; a stale `project.assets.json` can make both the package DLL and sibling project DLL appear in the same build and can also produce duplicate static-web-assets errors.

Before diagnosing or changing project references, restore for the intended configuration:

```powershell
dotnet restore <project.csproj> -p:Configuration=Debug
dotnet build <project.csproj> --no-restore -p:Configuration=Debug
```

Use `Release` in both commands when validating the package-reference path. Build consuming repositories sequentially because they share the sibling `Suttisak.Blazor` project outputs. Do not remove or alter the intentional Debug/Release reference selection merely to work around stale restore artifacts.
