# Task: GitHub Issues UI

## Plan

### Goal

Provide a feature-flagged, cross-platform GitHub Issues surface that stays easy
to reach from Sessions while keeping GitHub permissions and implementation
isolated from upstream Happy.

### Scope

- GitHub App authorization with repository-scoped Issue read/write access.
- Repository selection and project mapping.
- List, detail, create, close/reopen, and capability-gated deletion.
- Sidebar, phone-home, and session-context entries.
- Server proxy, normalized DTOs, tests, and deterministic errors.

### Out of scope

- Comments, rich administration, realtime sync, Agent assignment, and removal
  of Project Todos.

## Proposed slices

### T1 — Authorization contract

- [x] Confirm GitHub App registration and permission migration strategy.
- [x] Extend encrypted token persistence for expiry and refresh.
- [x] Add installation/repository discovery and permission diagnostics.

### T2 — Server Issue adapter

- [x] Confirm Close/Reopen plus capability-gated permanent-delete semantics.
- [x] Add feature-gated routes and small Happy-owned DTOs.
- [x] Implement list/detail/create/close/reopen.
- [x] Implement capability-gated GraphQL deletion.
- [x] Test core service normalization, PR filtering, traversal rejection, lifecycle, and deletion capability.

### T3 — Feature-local client module

- [x] Add flag, API client, repository picker, and list/detail/create screens.
- [x] Add connection, permission, loading, empty, retry, and error states.
- [ ] Add translations and component-level UI tests.

### T4 — Contextual integration

- [x] Add guarded sidebar and phone-home entries.
- [x] Add a guarded session shortcut.
- [x] Resolve a session's confirmed GitHub origin without persisting Issue content.

### T5 — Verification and rollout

- [x] Test both flags fail closed and retain Project Todos independently.
- [x] Run app/server typechecks and applicable test families.
- [ ] Verify phone, tablet, desktop, OAuth return, and destructive actions against a configured live GitHub App.

## Verify

- [x] AC1–AC10 are implemented or have an explicit validation gap.
- [x] Narrow model, flag, and repository-resolution tests pass.
- [x] Complete applicable app/server tests pass, or every gap is named.
- [x] Whole diff has no unrelated, generated, credential, or runtime files.

## Progress

- 2026-08-08: evidence-backed proposal and wireframes created; product and
  authorization decisions await review.
- 2026-08-08: implemented the feature-gated MVP across Happy app/server with
  GitHub App token refresh, selected-repository discovery, and contextual entry.

## Finish

Status: `implemented-with-verification-gaps`

### Outcome

- Feature-complete MVP on the isolated branch; live GitHub App/device verification remains.

### Evidence

| Command or review | Result | Notes |
| --- | --- | --- |
| App/server typechecks | passed | Both TypeScript projects pass. |
| Targeted tests | passed | 20 app/server tests across flags, parsing, and Issue service. |
| Full app tests | passed | Full Happy app Vitest suite passed. |
| Full server tests | accepted gap | 102/103 passed; pre-existing attachment local-download test returns 404 and also fails alone. |

### Remaining limits

- Live GitHub App installation/OAuth and device UI were not available in this local run.
- Rich cache, translations, comments, and project-row mapping remain outside the simple MVP.

### Reusable learning

- Existing legacy OAuth connections must reconnect through the GitHub App flow;
  an explicit credential kind prevents silent privilege reuse.
