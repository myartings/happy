# Workspace Project Discovery Tasks

## Contract

- PRD: `docs/PRD.md#workspace-project-discovery`
- Spec: `docs/specs/remote-workspace-project-discovery.md`
- Decisions:
  `docs/workspace/remote-workspace-project-discovery/decisions.md`
- Tracker boundary: local-only personal feature; external publication is not
  authorized.

Tasks are ordered by dependency. Each implementation task must preserve the
explicit non-goals and record exact validation in the active workflow.

## T1: Bounded daemon-side project scanner — completed

- Scope: Add the read-only workspace-project result contract and scanner with
  native path handling, recognized markers, deterministic ordering,
  deduplication, skip rules, depth/result bounds, root containment, and tolerant
  filesystem traversal.
- Allowed files: a focused module and tests under `packages/happy-cli/src/`;
  package-local test helpers only when required.
- Dependencies: none.
- Acceptance: AC7, AC8, scanner portion of AC1, and native Windows plus
  macOS/Linux path semantics from AC3.
- Closest validation: targeted Happy CLI Vitest scanner suite, followed by
  `pnpm --filter happy typecheck`.
- Review boundary: no App, Server, Sync Engine, spawn, metadata, or database
  behavior changes.

## T2: Optional Machine RPC exposure — completed

- Scope: Register `list-workspace-projects` on the existing Machine RPC manager,
  return the T1 contract, and keep errors bounded without logging project lists.
- Allowed files: `packages/happy-cli/src/api/apiMachine.ts`, its focused tests,
  and the T1 contract/scanner module when a narrow seam adjustment is needed.
- Dependencies: T1.
- Acceptance: Machine RPC portion of AC1; daemon compatibility boundary in AC5;
  AC8 and AC9.
- Closest validation: focused `apiMachine` test plus T1 tests and
  `pnpm --filter happy typecheck`.
- Review boundary: no Server routing/persistence, Sync Engine, encryption,
  Session protocol, or `spawn-happy-session` shape change.

## T3: App discovery request and picker-data layer — completed

- Scope: Add typed App-side RPC access, current-Machine request state, caller
  timeout, short-lived Machine-keyed memory cache, stale-response rejection,
  and pure construction/search/normalization/deduplication of Recent and
  Workspace Projects sections.
- Allowed files: focused modules and tests under
  `packages/happy-app/sources/sync/` and `packages/happy-app/sources/utils/` (or
  a feature-local directory), plus the narrow export in `sync/ops.ts`.
- Dependencies: accepted RPC response contract from T1/T2; implementation may
  use a test double before T2 lands but integration waits for T2.
- Acceptance: AC2, AC3, AC5, AC6, and the data/state portions of AC1 and AC4.
- Closest validation: targeted Happy App Vitest request-state and picker-data
  suites, followed by `pnpm --filter happy-app typecheck`.
- Review boundary: the data layer performs no UI rendering and does not mutate
  spawn requests, Machine metadata, Session metadata, or persistent storage.

## T4: Full New Session picker integration — completed

- Scope: Integrate T3 into the full New Session Working Directory picker only;
  request while open for an online Machine, render Recent before Workspace
  Projects with non-blocking states, and write discovered absolute paths into
  the existing selected-path state.
- Allowed files: `packages/happy-app/sources/app/(app)/new/index.tsx`, focused
  component/integration tests if feasible, and localization files only for
  user-visible state labels required by the spec.
- Dependencies: T2 and T3.
- Acceptance: AC1, AC4, AC5, AC6.
- Closest validation: focused New Session test or targeted data-state tests plus
  semantic inspection, then `pnpm --filter happy-app typecheck`.
- Review boundary: `HomeDock.tsx` remains behaviorally unchanged in V1; manual
  entry, Recent, Worktree, Agent/permission selection, and spawn flow remain
  intact.

## T5: Integration, benchmark, and whole-feature verification — completed with accepted gaps

- Scope: Run complete applicable typechecks and targeted suites; benchmark a
  representative workspace without recording private project paths; smoke the
  development daemon and full New Session picker; inspect the whole diff for
  forbidden surfaces and compatibility regressions; record unavailable manual
  evidence as an explicit gap.
- Allowed files: active workflow evidence and test-only fixture adjustments;
  product fixes must return to the owning task slice.
- Dependencies: T1-T4.
- Acceptance: AC1-AC12, with every criterion reconciled to recorded evidence.
- Closest validation:
  - `pnpm --filter happy typecheck`
  - `pnpm --filter happy-app typecheck`
  - targeted Happy CLI scanner/RPC Vitest suites
  - targeted Happy App request-state/picker-data Vitest suites
  - `py -3 scripts/validate-happy-workflow.py`
  - `py -3 scripts/test-workflow-core.py`
  - `py -3 scripts/test-workflow-ci.py`
  - `py -3 scripts/workflow-audit.py --strict --require-active`
- Review boundary: no private project list, credential, Session content, or
  absolute private path may enter Git evidence.

## Dependency graph

```text
T1 scanner contract
  -> T2 Machine RPC
  -> T3 App request/data layer
  -> T4 New Session integration
  -> T5 whole-feature verification
```

T3's pure data and request-state tests may begin against the accepted contract
after T1, but T4 and integration validation require T2 and T3 to be complete.
