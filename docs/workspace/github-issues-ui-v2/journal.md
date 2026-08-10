# Journal: `github-issues-ui-v2`

## `2026-08-10`

- Started workflow.
- User approved the Happy-native, Session-first wireframes.
- Approved automatic Session repository association and record-versus-dispatch
  creation behavior.
- Approved explicit Triage on Agent dispatch, with required maintainer decisions
  and automatic continuation after the confirmed Agent-ready outcome.
- Added the eight-slice implementation plan and acceptance ownership map.
- Completed Feature scoping and risk assessment with controls.
- Created `myartings/github-issues-ui-v2` from `dev` at
  `974b3daccccc73aa66be7a113c6ed423156c214c`.
- Recorded a serial batch plan; no writer subagents or additional worktrees are
  authorized.
- Completed T1 using seven RED/GREEN presentation-contract tests.
- Added feature-local list, detail, draft, and dispatch state contracts without
  changing route UI or exposing credentials, installation IDs, or transport
  payloads.
- Added preserved refresh state, translatable relative-time descriptors,
  case-insensitive repository identity, and structured Triage-first dispatch
  task construction behind the GitHub Issues feature Interface.
- Ran the complete GitHub Issues test family (37 tests), Happy app typecheck,
  and whitespace validation successfully.
- Kept Triage dispatch explicit: repositories known to require Triage receive
  `/triage`, while other repositories receive only their local workflow rules.
- Completed T2 with automatic Session repository resolution and a compact
  searchable repository picker.
- Moved `git remote -v` execution and parsing out of `GithubIssuesButton` and
  into the GitHub Issues Module; only fetch remotes contribute evidence.
- Added device-local last-repository and association storage keyed by exact
  machine/project path. Cache hits require a matching normalized remote
  fingerprint and current GitHub App accessibility.
- Made remote changes invalidate stale mappings. Ambiguous, inaccessible,
  missing, and failed detection open the picker without silently choosing an
  unrelated repository.
- Manual selection always remembers the last repository, and becomes a Session
  association only after successful evidence confirms there is no contradictory
  GitHub remote.
- Ran the expanded GitHub Issues/local-settings suite (62 tests), Happy app
  typecheck, and whitespace validation successfully.

- 2026-08-10: T1 complete: feature presentation contracts and helpers passed 36 GitHub Issues tests plus happy-app typecheck.

- 2026-08-10: T2 complete: automatic Session repository resolution, guarded local cache, remembered global repository, and searchable picker passed 62 focused tests plus happy-app typecheck.
- Completed T3-T5 with the Happy-native list, lifecycle-safe detail, and native
  New Issue form. Refresh failures preserve visible Issues and create failures
  preserve repository-scoped drafts.
- Completed T6 with current/other matching/new Session targets, append
  confirmation for existing drafts, project context preselection, and explicit
  Triage-first versus repository-rules prompts.
- Completed T7 with Settings-owned credential management, localized English and
  Simplified Chinese UI (safe English fallback elsewhere), accessible labels and
  selected/disabled states, deterministic blocking/error states, and bounded
  responsive surfaces.
- Completed T8 automated regression: 70 focused tests, 1052 Happy App tests,
  app/server typechecks, and workflow core/CI checks passed.
- Built, installed, and launch-verified Happy dev through happy-manager; the
  installed executable hash matches the generated NSIS artifact and the live
  window rendered the Issues entry.
- Accepted Android live gap after both all-ABI and x86_64-only JDK 17 builds
  failed in existing React Native CMake output due Windows 260-character paths.
- Recorded unrelated server attachment-download test failure (404 versus 200)
  without expanding product scope into the server.
