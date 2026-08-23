# Contributing

Thanks for taking the time to improve Suttisak.Blazor.

## Before you start

This repository is publicly visible but is not currently offered under an open-source license. Public visibility and the ability to submit a pull request do not grant a general license to copy, redistribute, sublicense, or reuse the code outside GitHub's platform permissions.

By submitting a contribution, you represent that you have the right to submit it and agree that the repository owner may use, modify, distribute, and relicense your contribution as part of this project.

## Development workflow

1. Create a branch from `master`.
2. Keep changes focused and avoid unrelated formatting churn.
3. Prefer existing shared components and patterns before introducing a new primitive.
4. Add or update tests for behavior changes.
5. Run the relevant verification locally before opening a pull request.

### Core verification

```bash
dotnet restore Suttisak.Blazor.slnx -p:Configuration=Release
dotnet build Suttisak.Blazor.slnx --configuration Release --no-restore

dotnet test Suttisak.Blazor.UserInterface.Tests/Suttisak.Blazor.UserInterface.Tests.csproj \
  --configuration Release --no-build --no-restore
```

### Playbook browser verification

```bash
cd Suttisak.Blazor.Playbook.E2ETests
npm ci
npx playwright install chromium
npm test
```

Pull requests that touch the UI library or Playbook are also verified by GitHub Actions.

## Security reports

Do not submit vulnerabilities or credentials through a public issue or pull request. Follow `SECURITY.md` instead.

## Scope and review

Maintainers may decline changes that increase API surface without a clear reusable contract, duplicate an existing component, introduce product-specific content into shared primitives, or weaken accessibility and test coverage.
