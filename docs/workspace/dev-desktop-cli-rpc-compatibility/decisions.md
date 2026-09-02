# Decisions: `dev-desktop-cli-rpc-compatibility`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | Which CLI is installed? | resolved | Build/install `packages/happy-cli` from the synchronized workspace; never publish or fetch `happy@latest`. Issue #98 and `install-local.cjs` establish this source. |
| D2 | What proves Saved Projects compatibility? | resolved | Resolve the globally installed local package's compiled bundle and require its `list-saved-projects` registration marker. Restart through that same package's exact `bin/happy.mjs` and require a valid replacement PID; display-only status and version checks are insufficient because status always exits zero and package version remains 1.2.2. |
| D3 | Where is the fail-closed boundary? | resolved | Build Desktop first, then establish CLI/daemon compatibility before Desktop backup/install/launch. New CLI/old App is backward-compatible; new App/unverified old CLI is forbidden by the accepted contract. |
| D4 | How is installation reused safely? | resolved | Reuse the repository-owned `cli:install`/`install-local.cjs` path with its new `--link-only` mode after happyctl's separate build. The ordinary developer command retains its composite default behavior, while refresh owns exact-executable daemon lifecycle and stage attribution. |
| D5 | Which platforms change? | resolved | macOS Dev refresh only. Linux/Windows and official-baseline flows retain existing behavior. |
| D6 | How are partial failures surfaced? | resolved | Track distinct CLI build/install, daemon restart, and compatibility fields plus a failed stage in the existing external update report; return the original nonzero status and never launch an unverified client. |
| D7 | How are daemon and scanned bundle identities coupled? | resolved | After link-only `cli:install`, realpath-compare npm's global `happy` package with the workspace package. Resolve both `bin/happy.mjs` and `dist/index.mjs` from that package, invoke daemon stop/start with `node` and the exact bin path, and ignore any competing PATH `happy`. Preserve each underlying nonzero status. |
