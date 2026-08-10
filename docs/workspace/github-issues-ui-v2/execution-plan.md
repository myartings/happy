# Execution Plan: `github-issues-ui-v2`

## Topology

- Owner: current primary implementation Session.
- Branch: `myartings/github-issues-ui-v2` based on `dev` at
  `974b3daccccc73aa66be7a113c6ed423156c214c`.
- Worktree: current Happy checkout; no additional writer worktree.
- Delegation: none. Do not spawn writer subagents without a new approved batch
  plan and isolated worktrees.

## Dependency batches

### Revision note

The original T1-T8 batches produced reusable Device Flow, repository resolution,
CRUD, draft, and dispatch foundations. Their desktop full-route composition is
superseded by the approved T9-T12 Session-panel revision below.

### Batch 5 — Quick surface

1. T9 Session-header anchored Issue popover.

Build on the existing Happy quick-panel overlay primitives. Do not alter the
right-workspace state model in this batch.

### Batch 6 — Durable Session surface

1. T10 right-workspace `Issues` panel registration and per-Session state.
2. T11 embedded list/detail/create/dispatch views and mobile sheet adapter.

T10 establishes the panel ownership contract; T11 then moves existing product
flows behind that contract without changing GitHub transport or permissions.

### Batch 7 — Cleanup and acceptance

1. T12 remove obsolete global/sidebar and centered-Modal composition.
2. Complete coexistence, isolation, feature-off, Windows, and mobile acceptance.

### Batch 0 — Approved contracts

- UI v2 spec, task plan, decisions, risk controls, context manifests, and
  validation ledger.
- Status: complete for planning.

### Batch 1 — Shared Module foundations

1. T1 feature presentation Interface and pure helpers.
2. T2 repository resolution/cache/picker.

Run serially because T2 depends on the shared Interface and both touch the
feature Module contracts and tests.

### Batch 2 — Product screens

1. T3 list redesign.
2. T4 detail/lifecycle redesign.
3. T5 creation/drafts.

These are conceptually independent after Batch 1, but the primary Session will
implement them serially because they share route layout, feature UI primitives,
and test fixtures. Re-run targeted feature tests after each slice.

### Batch 3 — Session bridge

1. T6 repository-safe current/new Session dispatch and Triage-first launch.

This waits for repository resolution, detail entry, and creation success flows.
It owns the narrow Session/New Session integration review.

### Batch 4 — Hardening and integration

1. T7 blocking states, localization, accessibility, and responsive polish.
2. T8 complete regression, build/install, and live acceptance.

## Shared-file conflict map

| Shared area | Owner/order |
| --- | --- |
| `features/github-issues/**` contracts and fixtures | Batch 1 first; later batches extend without redefining the Interface. |
| Legacy GitHub Issues route files and layout options | Historical T3-T6 ownership; T11 extracts embeddable views and T12 removes obsolete public entry seams. |
| Session/New Session drafts | T6 only; Project Todos remains reference/read-only unless an approved shared helper is extracted. |
| Settings/navigation host seams | T2/T7 with narrow guarded changes. |
| Translation catalogs | T7 after user-facing copy stabilizes. |
| Session header and anchored overlay | T9 only; reuse existing quick-panel primitives. |
| Right-workspace mode/state | T10 first; T11 consumes without redefining ownership. |
| Issue routes and embeddable views | T11; T12 removes only obsolete public entry seams. |

## Validation cadence

- Every task: nearest focused Vitest files plus Happy app typecheck.
- Every batch: complete GitHub Issues test family and `git diff --check`.
- Before finish: full applicable Happy app tests, repository workflow checks,
  whole-diff review, Windows Tauri build/install/live flow, and one mobile target
  when available.

## Stop conditions

- Any need for new GitHub permissions, backend routes, browser credentials,
  Session protocol changes, or protected native-project edits.
- Any inability to prove Issue/Session repository equality.
- Any draft overwrite, auto-send, Triage-bypass, or irreversible-delete safety
  regression.
- Any unexpected unrelated dirty file or official-profile/Project Todos change.
