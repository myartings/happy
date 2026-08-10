# Execution Plan: `github-issues-ui-v2`

## Topology

- Owner: current primary implementation Session.
- Branch: `myartings/github-issues-ui-v2` based on `dev` at
  `974b3daccccc73aa66be7a113c6ed423156c214c`.
- Worktree: current Happy checkout; no additional writer worktree.
- Delegation: none. Do not spawn writer subagents without a new approved batch
  plan and isolated worktrees.

## Dependency batches

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
| GitHub Issues route files and layout options | T3, then T4, then T5; T6 adds only dispatch integration. |
| Session/New Session drafts | T6 only; Project Todos remains reference/read-only unless an approved shared helper is extracted. |
| Settings/navigation host seams | T2/T7 with narrow guarded changes. |
| Translation catalogs | T7 after user-facing copy stabilizes. |

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
