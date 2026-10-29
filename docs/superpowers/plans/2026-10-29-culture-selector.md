# Culture selector reliability

**Goal:** A single language selection applies the requested culture and preserves the current encoded path, query, and fragment in Static SSR, Interactive Server, and Interactive WebAssembly.

**Approach:** Keep the native GET form and application-owned culture endpoint. Refresh its return URL at submission, require a full navigation, and derive selected state from the culture actually rendered rather than blindly trusting local storage. Keep standalone WebAssembly startup and endpoint behavior consistent with the same preference contract.

**Constraints:** Preserve public options and unrelated consumer changes. One implementation owner works in the clean library checkout because sibling Debug references require this location. Use isolated disposable test hosts, never production data. Follow the repository release sequence after verification.

## Work and acceptance

- [x] Reproduce stale navigation and mismatched selection with a persistent layout in real Static, Server, and WebAssembly test hosts; add encoded URL, fragment, keyboard, Auto, storage mismatch, and reload coverage.
- [x] Fix the shared selector and JavaScript; update Playbook culture endpoint, specimen, catalog, manifest, and integration documentation.
- [x] Run the Release solution build, shared tests, full Playbook browser suite, and one consumer Debug restore/build. Inspect desktop/mobile, themes, focus, reduced motion, and actual culture changes.
- [x] Freeze and independently review the final diff; resolve blocking findings.
- [ ] Bump UI package, commit/push, wait for CI, explicitly publish only the bumped package, then update all six consumers and validate each Release restore/build before committing/pushing their package-reference changes.

## Review focus

Persistent layouts must use the URL at activation time. Encoded separators must remain encoded. A stale browser preference must not claim a language different from the rendered content. Auto must resolve to a supported culture. Culture changes must create a new server circuit and restart WebAssembly culture initialization. Application subpaths must remain intact.

## Evidence

Initial inspection: the hidden return URL is only computed during rendering, excludes the fragment, and uses `UriFormat.Unescaped`. The browser overwrites server-rendered pressed state from local storage. AudiogramIQ uses a persistent Interactive Server layout and an application-owned cookie endpoint. Its worktree has unrelated changes; preserve them.

## Verified implementation

Integrated the already-published remote quality release (`ce6357f`) before preparing UI **1.0.40**. Added a disposable host with real Static SSR, Server, and hosted WebAssembly runtimes under `/test-app`, plus standalone Playbook coverage. No application database is used.

The original implementation failed on stale return routes, decoded query values, missing fragments, and stale pressed state. Independent fresh-context review then found blocked-storage WASM hydration losing the cookie culture. A failing regression demonstrated that issue; startup now falls back to the standard readable culture cookie only when no valid local preference can be read. Auto retains the host-owned cookie-clear contract, and the standalone endpoint resolves Auto before applying a culture.

Release solution build and **128 shared tests passed**. AudiogramIQ Debug restore/build passed using sibling source. The final full browser run passed **510 of 511** cases; `Nexora dark heading preserves the following task at 1024` hit Chromium `ERR_NO_BUFFER_SPACE` during `page.goto`, before assertions. Its unchanged focused rerun passed. All **13 culture cases** passed in the full run. Existing build warnings include dependency advisories and Identity compiler warnings; no assertions or thresholds were weakened.

Source review used exact SHA-256 snapshots rooted at `ce6357f`, without inherited conversation or implementation edits. Reviewer inspected source and maker-produced logs on the shared filesystem. Root also performed browser interactions in BrowserOS neo and inspected actual desktop/mobile render evidence. Consumer checkout preparation uses separate worktrees because five original checkouts are behind remote and contain unrelated edits; those originals remain untouched.

Remaining release work: publish only UserInterface 1.0.40 after successful CI; update all consumer references, handle their Auto endpoint branch, validate Release builds and affected tests, then push each consumer.
