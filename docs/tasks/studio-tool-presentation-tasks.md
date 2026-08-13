# Studio Tool Presentation Tasks

## Batch boundary

- Branch: `feature/studio-tool-presentation`
- Worktree: `.dev/worktree/studio-tool-presentation`
- Allowed product writes: `packages/happy-app/sources/components/tools/**` and
  `packages/happy-app/sources/features/studio-tool-presentation/**`.
- Read-only dependencies: Studio visual-style and semantic-text features.
- Blocked: composer, sidebar, overlay, ChatList/header, Markdown/message hosts,
  `CommandView`, `CodeView`, diff internals, protocols and settings schemas.
- Stop condition: any accepted behavior requires a host seam outside ownership.
- Return: one local clean commit, exact checks, and integration screenshot notes.

## T1 — Studio presentation contract ✅

- Add a fail-closed Studio resolver/hook with light/dark contained-surface,
  hierarchy, spacing, and semantic-state values.
- Validate Studio activation and non-Studio fallback.
- Depends on: none.

## T2 — Tool shell and hierarchy wiring ✅

- Wire the resolver into actual tool shell, compact row, header, section, and
  error components without changing callbacks or content decisions.
- Add actual component behavior/wiring coverage.
- Depends on: T1.

## T3 — Codex patch/diff refinement ✅

- Apply the same hierarchy to screenshot-visible Codex patch disclosure and
  diff/file metadata while preserving collapse, stats, diff, and permission
  ordering.
- Add expansion/collapse behavior coverage.
- Depends on: T1.

## T4 — Verification and handoff ✅

- Run focused tests, Happy App typecheck, workflow checks, staged CI, and a
  whole-diff review.
- Archive and commit locally. Parent owns integration, packaged capture, user
  acceptance, and merge order.
- Depends on: T1–T3.
