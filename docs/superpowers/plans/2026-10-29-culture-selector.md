# Culture selector reliability

**Goal:** A single language selection applies the requested culture and preserves the current encoded path, query, and fragment in Static SSR, Interactive Server, and Interactive WebAssembly.

**Approach:** Keep the native GET form and application-owned culture endpoint. Refresh its return URL at submission, require a full navigation, and derive selected state from the culture actually rendered rather than blindly trusting local storage. Keep standalone WebAssembly startup and endpoint behavior consistent with the same preference contract.

**Constraints:** Preserve public options and unrelated consumer changes. One implementation owner works in the clean library checkout because sibling Debug references require this location. Use isolated disposable test hosts, never production data. Follow the repository release sequence after verification.

## Work and acceptance

- [x] Reproduce stale navigation and mismatched selection with a persistent layout in real Static, Server, and WebAssembly test hosts; add encoded URL, fragment, keyboard, Auto, storage mismatch, and reload coverage.
- [x] Fix the shared selector and JavaScript; update Playbook culture endpoint, specimen, catalog, manifest, and integration documentation.
- [x] Run the Release solution build, shared tests, full Playbook browser suite, and one consumer Debug restore/build. Inspect desktop/mobile, themes, focus, reduced motion, and actual culture changes.
- [x] Freeze and independently review the final diff; resolve blocking findings.
- [x] Bump UI package, commit/push, wait for CI, explicitly publish only the bumped package, then update all six consumers and validate each Release restore/build before committing/pushing their package-reference changes.

## Review focus

Persistent layouts must use the URL at activation time. Encoded separators must remain encoded. A stale browser preference must not claim a language different from the rendered content. Auto must resolve to a supported culture. Culture changes must create a new server circuit and restart WebAssembly culture initialization. Application subpaths must remain intact.

## Evidence

Initial inspection: the hidden return URL is only computed during rendering, excludes the fragment, and uses `UriFormat.Unescaped`. The browser overwrites server-rendered pressed state from local storage. AudiogramIQ uses a persistent Interactive Server layout and an application-owned cookie endpoint. Its worktree has unrelated changes; preserve them.

## Verified implementation

Integrated the already-published remote quality release (`ce6357f`) before preparing UI **1.0.40**. Added a disposable host with real Static SSR, Server, and hosted WebAssembly runtimes under `/test-app`, plus standalone Playbook coverage. No application database is used.

The original implementation failed on stale return routes, decoded query values, missing fragments, and stale pressed state. Independent fresh-context review then found blocked-storage WASM hydration losing the cookie culture. A failing regression demonstrated that issue; startup now falls back to the standard readable culture cookie only when no valid local preference can be read. Auto retains the host-owned cookie-clear contract, and the standalone endpoint resolves Auto before applying a culture.

Release solution build and **128 shared tests passed**. AudiogramIQ Debug restore/build passed using sibling source. The final full browser run passed **510 of 511** cases; `Nexora dark heading preserves the following task at 1024` hit Chromium `ERR_NO_BUFFER_SPACE` during `page.goto`, before assertions. Its unchanged focused rerun passed. All **13 culture cases** passed in the full run. Existing build warnings include dependency advisories and Identity compiler warnings; no assertions or thresholds were weakened.

Source review used exact SHA-256 snapshots rooted at `ce6357f`, without inherited conversation or implementation edits. Reviewer inspected source and maker-produced logs on the shared filesystem. Root also performed browser interactions in BrowserOS neo and inspected actual desktop/mobile render evidence. Consumer checkout preparation uses separate worktrees because five original checkouts are behind remote and contain unrelated edits; those originals remain untouched.

The local browser transport failure above is superseded by two clean official runs: [CI 40846324317](https://github.com/Lukespacewalker/Suttisak.Blazor/actions/runs/40846324317) and [release 40849114138](https://github.com/Lukespacewalker/Suttisak.Blazor/actions/runs/40849114138), each passing all 511 browser cases and the shared tests. The release published only UserInterface **1.0.40**, from commit `f1f80190a5d6855bde41e74ac93f78d43e295ecb`. Consumer restore metadata confirms GitHub Packages as the source and that exact repository commit in the package manifest.

## Consumer integration and delivery

All six culture endpoints now clear the cookie for Auto. Five hosts previously recreated a fixed culture cookie on every page; they now persist only explicit cookie/query choices, retaining query-to-server-circuit initialization. The four Thai-default hosts have matching shared UI defaults, and their WebAssembly clients pass the same fallback where applicable.

Review identified another integration mismatch: JavaScript resolves English/Thai language families, but the standard ASP.NET Core provider does not map `en-GB` to `en-US` or neutral `th` to `th-TH`. Each host now replaces only its browser-language provider, preserving query and cookie precedence. The provider resolves supported language families by positive Accept-Language quality, with the existing host fallback. These host rules are required for consistent Auto behavior across server rendering and WebAssembly; the library continues to leave localization policy with its host.

Regression tests first failed against the original consumer behavior. Final validation passed all six configuration-specific Release restores/builds and **90 focused tests**. MentalInsight's architecture suite passed **38 tests**. CoeKPI's required full Release solution suite passed **88 tests**, including ten integration tests against disposable local PostgreSQL containers. No production data or application deployment was involved. Existing dependency/compiler warnings remain outside this change.

Independent read-only review accepted six base commits plus all **54 changed/untracked file hashes**, with no remaining findings or required evidence gaps. The reviewer inspected source and maker-produced logs; it did not independently execute tests. Actual browser interactions were exercised in the shared library's disposable hosts, not all six consumer applications.

All **11 Release PackageReference entries** were updated after successful publication; Debug ProjectReference entries remain unchanged. The following commits were pushed to each repository's `master` and verified against the remote:

| Consumer | Commit | Focused tests |
| --- | --- | ---: |
| AudiogramIQ | [e9847b2](https://github.com/Lukespacewalker/AudiogramIQ/commit/e9847b2bb57d3723ef3c3845c25f14e8653aadbc) | 17 |
| BafsWorkout | [8bbcde0](https://github.com/Lukespacewalker/BafsWorkout/commit/8bbcde027aef4c6a52af88481bf193ac3f998149) | 16 |
| HealthInsight | [dc1e9a8f](https://github.com/Lukespacewalker/HealthInsight/commit/dc1e9a8fe4441fe0ba5d6236069ef930dd4c5814) | 15 |
| CoeKPI | [bd7e79c](https://github.com/Lukespacewalker/CoeKPI/commit/bd7e79c2ada9d7e4c7860706d6ac2edf31fe75c9) | 16 |
| ErgoTrack | [a4f19de](https://github.com/Lukespacewalker/ErgoTrack/commit/a4f19deea449a55fb0bf18b890051a1c1e54fe4b) | 15 |
| MentalInsight | [eb2ef3f](https://github.com/Lukespacewalker/MentalInsight/commit/eb2ef3f5c7ca4714f9c8a9f01658942243404187) | 11 |

Clean integration worktrees remain under `H:/repos/Lukespacewalker/.codex-culture-consumers`. The original consumer checkouts and their unrelated edits were preserved; they were not rebased, reset, or updated in place. No app image release or deployment workflow was dispatched.
