# Master branch protection

The intended protection policy for `master` is versioned in
[`branch-protection.json`](branch-protection.json). Keeping the payload in the
repository makes governance reviewable and reproducible instead of relying on
an undocumented collection of GitHub settings.

## Policy

- changes reach `master` through pull requests
- branches must be up to date before merging
- `gitleaks` must pass
- `verify-playbook` must pass
- unresolved review conversations block merging
- stale approvals are dismissed after new pushes
- force pushes and branch deletion are disabled
- administrators follow the same protection rules
- no approval is required for the current single-maintainer workflow

The zero-approval setting is deliberate. It preserves the pull-request and CI
boundary without making a solo-maintained repository impossible to merge. Raise
`required_approving_review_count` when another regular maintainer is available.

## Apply the policy

The policy is a GitHub repository setting, not a file-system behavior. Apply or
refresh it with an authenticated GitHub CLI session that has repository
administration permission:

```bash
bash scripts/configure-branch-protection.sh
```

An alternate repository or branch can be supplied explicitly:

```bash
bash scripts/configure-branch-protection.sh owner/repository main
```

The script sends the versioned JSON payload to GitHub and then reads the active
configuration back for verification.

## Required check names

The contexts in the JSON payload must match the GitHub Actions job names:

- `gitleaks`
- `verify-playbook`

Renaming either job requires updating this policy in the same pull request.

## Recovery

A repository administrator can revise the JSON and rerun the script. Do not
disable protection merely to merge a failing change. Correct the workflow,
update an intentionally renamed context, or explicitly revise the policy with a
reviewable commit.
