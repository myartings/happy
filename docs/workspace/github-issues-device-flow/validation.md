# Validation: `github-issues-device-flow`

Record exact commands and results. Never mark a check passed unless it ran.
Use `unavailable` when the configured tool is not installed or cannot execute,
and state the consequence under Remaining gaps; unavailable is not a pass.

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| `2026-08-09` | `rg -n "githubIssues|HAPPY_GITHUB_ISSUES|github-issues|GithubUser" packages/happy-app/sources packages/happy-server/sources packages/happy-server/prisma` | passed | Located the client proxy, server routes/runtime/flag, auth-flow branches, and schema migration. |
| `2026-08-09` | Official GitHub documentation review | passed | Confirmed Device Flow client-ID exchange, polling errors, secret-free refresh for Device Flow tokens, expiring-token rotation, installation discovery, and public-client cautions. |
| `2026-08-09` | Secure storage/platform code review | passed | Expo SecureStore exists; generic web auth storage uses localStorage; Tauri HTTP is registered; desktop secure-store Adapter is absent and therefore in scope. |
| `2026-08-09` | `python scripts/workflow-state.py validate github-issues-device-flow` | passed | Workflow manifests, required gates, and linked local contracts are valid in design phase. |
| `2026-08-09` | `git diff --check` | passed | No whitespace errors; Git emitted only the repository's Windows LF-to-CRLF checkout warnings for two existing files. |
| `2026-08-09` | `python scripts/validate-happy-workflow.py` | passed | Happy selective workflow adoption valid. |
| `2026-08-09` | `python scripts/test-workflow-core.py` | passed | 14 tests passed in 29.985 seconds. |
| `2026-08-09` | `python scripts/test-workflow-ci.py` | passed | 14 tests passed in 56.853 seconds. |
| `2026-08-09` | `python scripts/workflow-audit.py --strict` | passed with expected gaps | Active design workflow is valid; implementation/check/review/finish remain future gates. |
| `2026-08-09` | `pnpm --filter happy-app exec vitest run sources/features/github-issues/githubIssuesClient.test.ts sources/features/github-issues/githubIssuesPlatform.test.ts` | passed | 2 files and 19 Device Flow, refresh, CRUD, GraphQL, storage-boundary, and trusted-host tests passed. |
| `2026-08-09` | `pnpm --filter happy-app typecheck` | passed | Client UI, Module, and platform Adapters typecheck. |
| `2026-08-09` | `pnpm --filter happy-server typecheck` | passed | Server proxy removal and official-profile restoration typecheck. |
| `2026-08-09` | `cargo check --manifest-path packages/happy-app/src-tauri/Cargo.toml` | passed | Desktop keyring commands compile for Windows. |
| `2026-08-09` | `pnpm --filter happy-app exec vitest run` | accepted gap | 1005 passed; unrelated 1 MB blob test exceeded its 5-second timeout under the full concurrent suite. |
| `2026-08-09` | `pnpm --filter happy-app exec vitest run sources/encryption/blob.test.ts` | passed | The previously timed-out file passed 9/9 alone; the 1 MB case completed in 1.959 seconds. |
| `2026-08-09` | `pnpm --filter happy-server test` | accepted gap | 94 passed; the pre-existing local attachment GET test still expects 200 but receives 404. |
| `2026-08-09` | `pnpm --filter happy-server exec vitest run sources/app/api/routes/attachmentRoutes.spec.ts` | accepted gap | The same unrelated failure reproduces alone: 19 passed, 1 failed. |
| `2026-08-09` | Issue runtime structural/security review | passed | No Issue runtime references to `/v1/github-issues`, Happy auth credentials, server URL, localStorage, or non-GitHub credential hosts remain. |
| `2026-08-09` | GitHub App settings inspection | passed | Read public Client ID `Iv23lia4SfuX4dSQlhFp`; enabled Device Flow; confirmed user-to-server token expiration is active. No secret/private-key value was read. |
| `2026-08-09` | GitHub App permission/installation inspection | passed | Minimal repository permissions are metadata read plus Issues read/write; installation `152218708` is limited to the selected `myartings/happy` repository. |
| `2026-08-09` | GitHub Device Flow live code request | passed | GitHub issued device and user codes with `https://github.com/login/device`, 899-second expiry, and 5-second polling interval; ephemeral codes were not recorded. |
| `2026-08-09` | `pnpm --filter happy-app exec tauri build --config src-tauri/tauri.dev.conf.json` with public GitHub App environment | passed | Windows release executable, MSI, and NSIS bundles built successfully. |
| `2026-08-09` | `happy-manager update-desktop` and `verify-desktop` against the feature build | passed | Installed executable hash matched the build artifact; backup retention, registry snapshot, launch path, and process smoke checks passed. |
| `2026-08-09` | `pnpm --filter happy-app exec vitest run sources/features/github-issues/githubIssuesPlatform.test.ts` before transport fix | failed as expected | New regression reproduced the UI's raw `TypeError: Failed to fetch` when response-body reading rejected outside the transport error boundary. |
| `2026-08-09` | Tauri HTTP package protocol comparison | passed | Frontend package `2.5.6` used pull-based `fetch_read_body`; locked Rust `2.5.2` required a `Channel`, proving an incompatible response-stream protocol pair. |
| `2026-08-09` | `cargo tree ... -p tauri-plugin-http` plus installed package version | passed | Frontend and Rust Tauri HTTP plugins are now both pinned to `2.5.6`. |
| `2026-08-09` | targeted Issue tests and app typecheck after HTTP fix | passed | 20/20 tests passed; response-body failures are normalized and TypeScript passes. |
| `2026-08-09` | rebuild, `happy-manager update-desktop`, and `verify-desktop` after HTTP fix | passed | Fixed NSIS build installed; executable hash `E6B7F849...B4ACE9` matched and launch smoke passed. |
| `2026-08-09` | `githubIssuesAuthorizationSession.test.ts` before lifecycle implementation | failed as expected | The feature had no navigation-independent authorization-session seam; leaving the Issue screen aborted polling and discarded the verification prompt. |
| `2026-08-09` | authorization session plus targeted Issue suites | passed | 22/22 tests passed, including unsubscribe/re-subscribe prompt retention and explicit-only cancellation. |
| `2026-08-09` | rebuild, install, and launch after authorization lifecycle fix | passed | Installed executable hash `D58A9C60...AA405A5` matched; Happy dev launch smoke passed. |
| `2026-08-09` | Windows live navigation during Device Flow | passed | User confirmed the verification code remains visible after switching from GitHub Issues to Session and back; screen unmount no longer cancels authorization. |
| `2026-08-09` | `githubIssuesScreen.test.ts` before external-link fix | failed as expected | Clicking `Open GitHub` bypassed the shared Tauri-aware external URL Adapter, so the Adapter received zero calls. |
| `2026-08-09` | targeted Issue suites and app typecheck after external-link fix | passed | 23/23 tests passed; the Device Flow and repository-access links now use the shared external URL Adapter. |
| `2026-08-09` | rebuild, install, and launch after external-link fix | passed | Installed executable hash `D4242378...E9E33DF4` matched; Happy dev launch smoke passed. |
| `2026-08-09` | Windows live `Open GitHub` action | passed | User confirmed the Device Flow action opened GitHub automatically in the system browser. |
| `2026-08-09` | Windows live Device Flow completion and repository discovery | passed | User completed GitHub authorization and confirmed that the selected `myartings/happy` repository appeared in Happy. |
| `2026-08-10` | Windows live Issue-list layout inspection | failed | Screenshot showed the filter row outside the centered content column; selected `Open` text was white on the page background and `New issue` was pushed off-screen. |
| `2026-08-10` | `githubIssuesScreen.test.ts` before Issue-action layout fix | failed as expected | The rendered `New issue` action had no `ItemGroup` ancestor and used the white primary-button foreground instead of the page link color. |
| `2026-08-10` | targeted Issue suites and app typecheck after layout fix | passed | 24/24 tests passed; Issue actions are grouped inside the centered card and use the visible link color. |
| `2026-08-10` | rebuild, install, and launch after layout fix | passed | Installed executable hash `D4D0D775...C98028A4` matched; Happy dev launch smoke passed. |
| `2026-08-10` | Windows live Issue-list layout and create-entry check | passed | User confirmed the centered layout renders correctly and the `New issue` action is visible. |
| `2026-08-10` | Windows live Issue creation | passed | User created the temporary acceptance Issue through Happy and reached the Issue detail flow. |
| `2026-08-10` | Windows live Issue-detail state-action inspection | failed | User could see `Permanently delete` but not `Close issue`; the state action was rendered white on the light page background. |
| `2026-08-10` | `githubIssuesDetailScreen.test.ts` before state-action color fix | failed as expected | Both open and closed fixtures rendered their `Close issue` / `Reopen issue` labels with the white primary-button foreground. |
| `2026-08-10` | targeted Issue suites and app typecheck after detail fix | passed | 26/26 tests passed; close and reopen actions now use the visible page link color. |
| `2026-08-10` | rebuild, install, and launch after detail fix | passed | Installed executable hash `70C8A963...9552FE9` matched; Happy dev launch smoke passed. |
| `2026-08-10` | Windows live Issue close and Closed-list refresh | passed | User closed the temporary Issue and confirmed it appeared in the Closed list. |
| `2026-08-10` | Windows live Issue reopen and Open-list refresh | passed | User reopened the temporary Issue and confirmed it returned to the Open list. |
| `2026-08-10` | Windows live capability-gated permanent Issue deletion | passed | User permanently deleted the temporary acceptance Issue through Happy; it was removed from the repository lists. |
| `2026-08-10` | Windows secure credential persistence across rebuilds/restarts | passed | The GitHub Issues connection survived multiple Happy dev rebuild/install/restart cycles and continued loading the selected repository without reauthorization. |
| `2026-08-10` | `cmdkey /list` metadata-only credential inspection | passed | Windows Credential Manager lists the app-scoped target `github-issues-device-flow-v1.com.slopus.happy.dev` and account name; no secret value was read or recorded. |
| `2026-08-10` | `pnpm --filter happy-app exec vitest run` | passed | Full app suite passed: 100 files and 1013 tests, including all GitHub Issues and Project Todos coverage. |
| `2026-08-10` | `pnpm --filter happy-server test` | accepted gap | 94/95 tests passed. The unrelated pre-existing local attachment GET test expected 200 and received 404. |
| `2026-08-10` | isolated `attachmentRoutes.spec.ts` rerun | failed independently | The same unrelated local attachment GET case failed alone (19/20 passed), confirming it is not an Issue-suite concurrency effect. |
| `2026-08-10` | app and server typechecks | passed | Both configured TypeScript typechecks completed without errors. |
| `2026-08-10` | workflow validation/core/CI tests and strict audit | passed with documented gaps | Workflow validator passed; both workflow Python suites passed 14/14; strict audit reports only pending final gates. |
| `2026-08-10` | final structural and credential-boundary review | passed | No Issue runtime references the retired server route or Happy credentials; GitHub Authorization is constructed only inside the trusted-host transport boundary, no plaintext/browser fallback or token logging was found. |

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| Migration scope and platform support are explicit | verified | Device Flow specification Goal, Non-goals, and User experience. |
| Credential and transport boundaries are explicit | verified | ADR 0006, implementation review, host/storage tests, and Windows credential metadata inspection. |
| Official GitHub profile remains independent | accepted gap | Implementation matches upstream and credentials are separately namespaced; live disconnect/isolation and a dedicated regression test remain follow-ups. |
| Server/database retirement is reversible | verified | Server routes are removed, historical migration is preserved, cleanup is deferred, and finish.md records rollback. |
| Implementation acceptance criteria are testable | verified | Fourteen acceptance criteria, verification matrix, full app suite, typechecks, and exact live evidence are recorded. |
| Runtime behavior is implemented | accepted gap | Windows Device Flow, persistence, repository discovery, and full Issue CRUD passed; mobile live acceptance remains open. |

## Remaining gaps

- GitHub App configuration, Device Flow completion, cross-screen authorization
  persistence, repository discovery, Windows secure credential persistence,
  build/install/launch, and live Issue CRUD are verified.
- macOS and Linux live secure-store acceptance may be unavailable locally and
  must not be reported as passed without real evidence.
- No iOS/Android live acceptance was available on this Windows run.
- Issue-only disconnect/reconnect and official Happy GitHub profile isolation
  remain manual acceptance gaps because disconnecting would remove the accepted
  device credential and require another authorization cycle.
- The server suite has one unrelated pre-existing attachment-route failure that
  reproduces in isolation; the full app suite is green.
