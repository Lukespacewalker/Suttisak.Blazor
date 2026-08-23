#!/usr/bin/env bash
set -euo pipefail

repository="${1:-Lukespacewalker/Suttisak.Blazor}"
branch="${2:-master}"
script_directory="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
policy_file="${script_directory}/../.github/branch-protection.json"

if ! command -v gh >/dev/null 2>&1; then
  echo "GitHub CLI (gh) is required." >&2
  exit 1
fi

if [[ ! -f "${policy_file}" ]]; then
  echo "Branch protection policy not found: ${policy_file}" >&2
  exit 1
fi

gh auth status

echo "Applying branch protection to ${repository}:${branch}..."
gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2026-03-10" \
  "repos/${repository}/branches/${branch}/protection" \
  --input "${policy_file}"

echo
echo "Active branch protection:"
gh api \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2026-03-10" \
  "repos/${repository}/branches/${branch}/protection"
