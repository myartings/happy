# Context: `saved-main-projects`

## Goal

Deliver Issue #84 as one Slice: an explicit machine-local Saved Project
registry drives project selection and safe main-path New Session start; linked
worktrees never become project identities.

## Repository evidence at acceptance

- `packages/happy-cli/src/workspace/workspaceProjectScanner.ts` discovers marker
  directories beneath `~/workspace` but has no stable identity or persistence.
- `packages/happy-cli/src/api/apiMachine.ts` exposes only the scanner RPC and
  accepts a caller directory for spawn.
- `packages/happy-app/sources/utils/workspaceProjectDiscovery.ts` mixes scan
  results with Session-derived Recent paths.
- `packages/happy-app/sources/app/(app)/new/index.tsx` renders those sources and
  owns a duplicate direct spawn flow.
- `packages/happy-app/sources/hooks/useStartSessionFromDraft.ts` is the accepted
  shared start/cancel state machine.

## Boundaries

- Source: https://github.com/myartings/happy/issues/84
- Base: `refs/remotes/origin/dev@304450403ea6c84d475f0ebc34f1c1fdc302bd2c`
- Branch: `issue/84-start-new-session-from-machine-saved-main-projec`
- Worktree: `C:\Users\myartings\workspace\.worktrees\happy-issue-84`
- Root topology: serial `current-root`; no writer delegation or batch.
- Excluded: protected paths, auth, Server persistence, native iOS/Android
  projects, user-directory mutation, deployment, and tracker writes.

## Accepted authorities

- Feature contract: `docs/specs/codex-aligned-new-session-projects.md`
- Checklist: `docs/tasks/saved-main-projects-tasks.md`
- Growth policy: `docs/workflow/discovered-work-scope-containment.md`

