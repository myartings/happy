# Execution Plan: `codex-first-happy-client`

## Execution mode

The main Goal session owns every product-code edit, integration step, and check
in the existing isolated `smooth-valley` worktree. No writer subagents or
parallel worktrees are authorized for this run. Tasks execute serially even
where the dependency graph permits conceptual parallelism, because several
slices share shell, Session, Composer, and presentation contracts.

The branch was fast-forwarded to current personal `dev` commit `a269068a`
before product edits. No merge, rebase, commit, push, publication, or external
tracker mutation is part of this plan.

## Ready inventory

| Batch | Task | Entry condition | Exit evidence |
| --- | --- | --- | --- |
| 0 | T01 desktop contract and rollback | Scoping/risk gates pass | Runtime/presentation/local-settings tests and App typecheck |
| 1 | T02 product shell | T01 contract stable | Shell projections, route reachability, typecheck |
| 2A | T03 project navigation/search/attention | T02 shell stable | Grouping, palette/search, attention tests |
| 2B | T04 empty and New Session | T02 shell stable; run after 2A in this worktree | Empty-state and full spawn/draft tests |
| 3 | T05 conversation shell | T01/T02 stable | Conversation/semantic/composer tests |
| 4 | T06 tool/approval loop | T05 stable | Tool, approval payload, composer-state tests |
| 5 | T07 panels/overlays/Settings | T03/T05 stable | Panel, overlay, palette, Issues, route tests |
| 6 | T08 responsive/accessibility | T03–T07 integrated | Projection, keyboard, focus, gating tests |
| 7 | T09 packaged evidence | All product slices pass | Release bundle, signature, install/launch, runtime evidence |
| 8 | T10 whole-feature closure | T09 evidence complete | AC trace, full checks, review and handoff |

T03 and T04 are conceptually independent after T02, but execute serially in
this worktree. Integration and evidence remain serial.

## Shared-file and conflict map

| Shared area | Touching tasks | Serial ownership rule |
| --- | --- | --- |
| `features/codex-first-shell/**` | T01–T08 | T01 owns base contracts; later tasks extend without changing earlier semantics silently |
| `SidebarNavigator.tsx` / `SidebarView.tsx` / `MainView.tsx` | T02–T04, T08 | T02 establishes host composition; T03/T04 add bounded surfaces; T08 hardens projection |
| Session-list components and display utilities | T03, T08 | T03 owns data/presentation projection; T08 may add responsive/a11y seams only |
| `CommandPalette/**` | T02, T03, T07, T08 | T02 owns invocation; T03 owns index/results; T07 owns overlay integration; T08 owns keyboard/a11y |
| New Session page/hooks | T04, T08 | T04 owns composition and behavior; T08 adds responsive/a11y coverage |
| Session view/header/list | T05–T08 | T05 owns global conversation composition; later tasks add state/panel/hardening seams |
| `AgentInput.tsx` and Studio Composer | T05, T06, T08 | Preserve Fast mode and backend controls; T06 owns lifecycle state; T08 owns focus/responsiveness |
| Studio tool/transcript modules | T05, T06 | T05 changes activation contract; T06 owns behavior/state verification |
| overlays and panel resize | T02, T07, T08 | Product-shell overlay first, workspace integration second, hardening last |
| local and personal settings | T01, T02, T08 | T01 owns rollback/default compatibility; later tasks preserve every personal feature key |
| translations | T02–T08 | Add copy with its owning surface; final consistency check in T08 |
| workflow evidence | all | Append after each verified slice; final reconciliation belongs to T10 |

## Ownership boundaries

### Allowed product surface

- `packages/happy-app/sources/features/codex-first-shell/**`
- Existing `studio-*` feature modules
- Narrow Happy App component, route, settings, localization, responsive, and
  keyboard seams named in the task list
- Focused Happy App tests beside the affected public interfaces

### Blocked product surface

- `.env*`, secrets, credentials, `.git/**`
- `packages/happy-app/android/**` and `packages/happy-app/ios/**`
- Happy Server or CLI protocol/schema behavior
- Authentication, authorization payloads, encryption, synchronization,
  Machine RPC, Session protocol, and data migrations
- Generated `node_modules/**`, Expo output, coverage, and
  `packages/happy-app/src-tauri/target/**`

Reference screenshots and private runtime content stay outside tracked source.

## Integration discipline

1. Run the owning task's focused red/green tests before and after its code.
2. Run Happy App typecheck at every host-seam boundary.
3. Inspect `git diff --check` and the current task's protected boundary after
   every batch.
4. Keep the development rollback passing until T10 and final user acceptance.
5. If current `dev` advances again into a shared source area, stop the current
   slice at a green boundary, inspect divergence, then integrate only through a
   recoverable plan.
6. Product defects found during T09 return to their owning task; evidence files
   do not mask product behavior.

## Stop conditions

- A required edit crosses the risk boundary in `risk-assessment.md`.
- A Codex parity choice cannot preserve a Happy capability through a bounded
  deviation.
- A shared contract requires data/schema migration.
- Deterministic tests cannot distinguish the intended permission or lifecycle
  behavior.
- The development App target or backup state cannot be proven before install.

## Return contract

The main session closes each batch with changed files and user-visible outcome,
exact commands and results, affected acceptance criteria, new or closed
deviations, and next-batch status.

T10 returns the complete installable App path and installed identity, AC
traceability, evidence index, deviations, limitations, rollback, and final
acceptance request.
