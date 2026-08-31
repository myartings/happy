# Scoping: `codex-first-happy-client-dev-integration`

## Classification

- Intensity: `feature`.
- Result: `ready` once acceptance, decision, and risk receipts are recorded.
- Ownership: serial main-session integration; no independent writer or task
  queue is needed. PR #78 is the configured human-visible tracker boundary.

## Exact scope

- Feature parent: `e9c76eee00aa7320b0881a75a19f450993601773`.
- Target parent: `68cfb6f915fb25f5ecd444df2aefafeccae92fa8`.
- Known textual conflicts: `docs/PRD.md` and
  `docs/workspace/archive.md`.
- Highest-risk semantic overlap:
  `packages/happy-app/sources/app/(app)/new/index.tsx`, shared App shell and
  Studio seams, `sources/sync/agentCommunications*`, workflow tooling, and
  Windows `happyctl`.
- Product edits beyond conflict documents are forbidden until a focused
  integration-only RED exists.

## Validation strategy

1. Compare conflict stages and resolve the two documents as exact unions.
2. Scan all auto-merged overlaps and run focused Codex-first, New Session,
   project-discovery, App sync, CLI transport/workspace, wire, and workflow
   tests.
3. Run the merged repository's candidate-bound full profile and strict audit.
4. Run Windows doctor/smoke and native build without installation.
5. Review the whole merge delta against both parents, archive, pass staged and
   committed workflow CI, push normally, and verify PR #78.

## Boundaries

- Protected paths from `.ai/project.json`, installed-state mutation, auth,
  protocol redesign, unrelated baseline repair, PR merge, signing, publication,
  and release are excluded.
- Generated native outputs are evidence only and remain untracked.
- A deterministic failure blocks progression until classified; it is never
  waived by chat alone.
