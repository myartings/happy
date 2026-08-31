# GitHub Issue current Session association tasks

Status: accepted client-only replan; GitHub Issue #79 reconciled and verified;
T1-T5 deterministically implemented, T6 verification in progress

## Goal

Replace the uncommitted dedicated-server implementation with one personal
Happy-client feature that coordinates a current Issue Session across daemon
platforms through the official account KV API.

## Dependency graph

```text
T1 Freeze reconciled contract and RED public seam
                  │
                  ▼
T2 Restore official server/daemon baseline
                  │
                  ▼
T3 Add encrypted bidirectional KV association
                  │
          ┌───────┴────────┐
          ▼                ▼
T4 Claim-before-send   T5 Projection/lifecycle
          └───────┬────────┘
                  ▼
T6 Whole-candidate verification and desktop live acceptance
```

The tasks are internal units of one Issue #79 delivery slice. They overlap in
the GitHub Issues feature module and remain serial under the current Root.

## T1 — Freeze the client-only contract and RED seam

### Scope

- Record the accepted distinction between Happy viewer clients and daemon-hosted
  Sessions.
- Define participating-client uniqueness, existing-KV dependency, privacy,
  compatibility, transfer-marker, rollback, and no-history boundaries.
- Add public behavior tests that require atomic Issue/Session KV mutations and
  cross-platform winner reconciliation without a custom server endpoint.

### Allowed files

- `docs/adr/0007-canonical-github-issue-session-binding-authority.md`
- `docs/specs/github-issue-canonical-session-binding.md`
- this task plan and target Workspace evidence
- focused Happy App tests

### Acceptance

- The local contract contains no server migration, daemon change, mobile gate,
  or full history requirement.
- The live tracker matches the accepted client-only contract before product
  implementation continues.
- RED proves the App lacks the accepted existing-KV association seam.

### Validation

- Spec/ADR/task traceability inspection.
- Focused App RED command recorded in `validation.md`.

## T2 — Restore the official server and daemon baseline

### Scope

- Remove every Issue #79 Prisma migration, schema model, route, authority,
  socket capability gate, delete hook, and server test.
- Remove client protocol types and calls that depend on those custom endpoints
  or events.
- Prove the resulting server tree matches the accepted base for Issue #79.

### Allowed files

- only Issue #79 changes under `packages/happy-server/**`
- obsolete binding transport seams under `packages/happy-app/sources/**`

### Acceptance

- `git diff <base> -- packages/happy-server` is empty for Issue #79.
- Existing unrelated server changes, if discovered, are preserved and surfaced.
- Server typecheck and closest affected suites pass.

### Validation

- Server diff inspection.
- `pnpm --filter happy-server typecheck`.
- Existing Session/API/socket tests affected by restoration.

## T3 — Implement encrypted bidirectional KV association

### Scope

- Derive opaque Issue and Session KV keys from account-scoped material.
- Encrypt and validate versioned current/transfer payloads.
- Read exact keys and use one `kvMutate` batch for claim or replacement.
- Reconcile 409, timeout, cancellation, and ambiguous 5xx outcomes by refetching
  before declaring failure.
- Cache only validated account-scoped projections in MMKV.

### Allowed files

- `packages/happy-app/sources/features/github-issues/**`
- existing `packages/happy-app/sources/sync/apiKv.ts` consumption
- narrow persistence/sync seams needed for cache and KV notifications

### Acceptance

- One Issue-current and one Session-current direction succeed or fail together.
- A competing claim returns the winner without overwriting it.
- Replacement updates the current records and former direct transfer marker in
  one expected-version mutation.
- Server-visible keys and values disclose no GitHub or Session identity.

### Validation

- KV adapter/identity/encryption/race/replacement tests.
- Happy App typecheck.

## T4 — Enforce claim-before-send across daemon platforms

### Scope

- Carry structured Issue intent through existing-Session adoption and New
  Session creation on any selected daemon platform.
- Claim after Session creation and before the first Issue task.
- Navigate losing clients to the winner and stop/archive unused empty Sessions
  best-effort.
- Preserve draft text and safe localized errors across retry and account change.

### Allowed files

- GitHub Issue detail and workspace surfaces
- New Session draft/start hooks
- feature-local dispatch and intent modules

### Acceptance

- Concurrent different-daemon starts send exactly one first Issue task.
- Bound Issues never prepare a second task on participating clients.
- Direct CLI/daemon work remains explicitly outside detection and enforcement.

### Validation

- Dispatch orchestration and New Session focused tests.
- Existing draft/session creation regressions.

## T5 — Project current, transferred, and repair states

### Scope

- Resolve current association on Issue open, reconnect, and account change.
- Project Current, Cached/Offline, Transferred, Conflict, and Repair on desktop
  Session list, header, and information surfaces.
- Preserve association across stop/archive/restore/rename and detect hard
  deletion or unreadable payloads.
- Keep side chats and ordinary/worktree forks unassociated.

### Allowed files

- feature-local projection/lifecycle modules
- Session list/header/info host seams
- translations and accessibility tests

### Acceptance

- Session title, `Session.tag`, provider id, Agent Goal, branch, and worktree
  remain unchanged.
- Former Sessions show at most a direct transfer action, never a history list.
- Desktop states are localized, accessible, and not color-only.

### Validation

- Projection, lifecycle, fork, localization, and accessibility tests.
- Happy App typecheck.

## T6 — Verify the complete reconciled candidate

### Scope

- Run focused suites, full applicable checks, and independent High-risk review.
- Verify no Happy Server or daemon change remains.
- With separate authorization, exercise two daemon platforms or machines under
  a non-production account and capture redacted evidence.

### Acceptance

- AC1–AC10 map to deterministic evidence.
- One checked candidate passes independent Spec and Standards review.
- No mobile, PostgreSQL, production deployment, tracker mutation, commit, push,
  PR, or release is implied by verification.

### Validation

- `pnpm --filter happy-app typecheck`
- `pnpm --filter happy-server typecheck`
- `pnpm --filter happy-app exec vitest run`
- `pnpm --filter happy-server test`
- `python scripts/workflow-check.py --applicable`
- `git diff --check`
- independent Spec and Standards review

## Stop conditions

Return to the owning decision/risk boundary if:

- the official service does not expose the existing KV behavior assumed by the
  checked base;
- participating-client uniqueness proves impossible without a server or daemon
  change;
- privacy requires plaintext Issue or Session identity in KV keys/values;
- direct CLI/old-client enforcement is requested;
- GitHub Issue #79 remains the delivery source but its body is not authorized
  for reconciliation; or
- live acceptance requires launching clients, signing in, or mutating test KV
  without separate authority.
