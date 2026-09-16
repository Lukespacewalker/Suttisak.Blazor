# Playbook component pages

Owner: Root. Approved design: group related components on one documentation page, retain every public API and existing URL, and focus unrelated specimens on the selected subject.

## Outcomes and constraints

- Keep the existing Playbook visual language and reusable library unchanged.
- Group Select, Radio, Tabs, Navigation, Data Grid, Form Composition, and Date & Time Pickers. Group Marketing proof and step pairs; show focused Marketing examples rather than duplicating a landing page.
- Preserve all 93 catalog entries and machine-readable identifiers. Add explicit page membership and canonical documentation links to the manifest.
- Cards and the detail sidebar list documentation pages. Search matches every member; an exact component search opens that member's API.
- Legacy URLs redirect to their canonical page and member anchor, retaining query parameters. Shared previews remain interactive at all existing widths.

## Work

- [x] Add browser regressions for grouped discovery, member search, old routes, API selection, and focused specimens; demonstrate failures.
- [x] Add a page catalog and use it for browsing, detail navigation, member API selection, related links, and manifest generation.
- [x] Focus Advanced Inputs and Marketing specimens by subject; include pagination in the shared Data Grid page.
- [x] Update affected browser assertions for intentional grouping, run build, shared tests, and the Playbook browser suite.
- [x] Inspect desktop/narrow and light/dark renders, keyboard/API navigation, history, and old links. Review the final diff and record evidence.

Acceptance: each public component remains searchable and has its own API; one card/sidebar item per page; old routes resolve to the right member; grouping does not remove interaction coverage or create unrelated previews. No package release is needed because library source and public APIs are unchanged.

## Acceptance evidence

- Documentation pages: 93 component identities retained in 75 pages; all manifest metadata retained with additive canonical links and membership.
- Release solution build passed. A clean earlier build reported the existing BL0008 warning in untouched Identity/RegistrationPage.cs; no new warnings were introduced.
- Shared .NET suite: 64 passed.
- Full Playbook Chromium suite: 237 passed (3.1 minutes), including all existing pagination/virtualization interactions and seven new grouping regressions. The first run exposed fragment loss and lost pagination coverage; both were fixed and the full suite rerun.
- Independent read-only review: material source criteria PASS against HEAD d133e3b plus the frozen dirty/untracked SHA256 delta. Reviewer had no maker role or inherited conversation; shared workspace, no isolation. Root performed actual browser render/interaction checks.
- BrowserOS checks: desktop component cards/search and Select member navigation; 390px dark Marketing Proof page with collapsed page navigation and edited proof value. Automated checks additionally cover keyboard focus, Back, reload, theme/viewport preservation, and constrained previews.
- Paginator retains its focused pagination/virtualization example inside the Data Grid page when its API is selected. Other members use the shared table example.
- Final review copy clarification: badges state the number of components documented on the page, avoiding claims that unrelated shared renderer implementations are dedicated specimens.
- No reusable library code or public API changed; no package release or consumer update is required.

## Integration validation (current)

The initial counts above describe the reviewed implementation before integration. Rebasing onto `63b647f` retained the separately released Data Grid changes and added their two new catalog entries. The current catalog has 95 components in 77 documentation pages. This supersedes the initial 93/75 counts without changing the nine documentation families.

The only rebase conflict was the generated manifest, resolved by running PlaybookManifestGenerator against the merged catalog. The component-detail and specimen-registry patches remained equivalent under `git range-diff`. After integration, the Release solution build, all 71 shared .NET tests, and all 245 Playbook Chromium tests passed. The reusable UI library remains unchanged relative to the remote release; no additional package publication is needed for this commit.
