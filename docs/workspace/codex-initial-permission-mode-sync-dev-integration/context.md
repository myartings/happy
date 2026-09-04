# Context: `codex-initial-permission-mode-sync-dev-integration`

## Goal

Integrate `origin/dev@b6a79dbe` into the permission-mode fix without losing
either the launch-pinned Codex initialization behavior already on `dev` or the
fresh/reconnect permission metadata guarantees in `910097e4`.

## Accepted boundary

- Source parent: `910097e4f453326f877b06b28bf926b56f0d9287`.
- Target parent: `b6a79dbe793e513b4aa30d7344819d659d2e02a9`.
- Common ancestor: `1e03026a5febe5815a47687c7b220aa6c6dba758`.
- Manual conflicts are limited to `packages/happy-cli/src/codex/runCodex.ts`
  and `packages/happy-cli/src/api/apiSession.test.ts`.
- The resolution preserves both parent intents; relative to the target parent,
  product changes remain exactly the reviewed eight-file permission-mode fix.
- Novel lifecycle files are limited to this integration Workspace, its spec,
  task checklist, and the canonical archive projection.
- No rebase, reset, amend, force-push, branch deletion, release, or install.

## Execution

- Owner/topology: current Root, serial `current-root` in the existing worktree.
- Test authority: focused conflict tests, CLI typecheck/full tests, complete
  candidate-bound applicable checks, independent Spec and Standards review,
  staged/committed workflow CI, hosted PR checks, and final remote inspection.
- Any product redesign, unrelated repair, or conflict outside the two named
  files requires a separate accepted delivery slice.

No role manifests are needed because work remains serial in this Root context.
