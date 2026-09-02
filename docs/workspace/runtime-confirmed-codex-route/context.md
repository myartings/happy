# Context: `runtime-confirmed-codex-route`

Issue #80 is one serial Feature Slice owned by the current Root in the exact
registered Issue worktree. The deterministic router confirmed fresh-session
binding on 2026-09-01. No writer dispatch is planned, so role manifests are not
materialized.

## Implementation context

- `packages/happy-cli/src/api/types.ts`: public optional metadata contract.
- `packages/happy-cli/src/codex/codexRuntimeModelMetadata.ts`: requested-state
  helper and planned atomic effective-pair authority seam.
- `packages/happy-cli/src/codex/codexAppServerTypes.ts`: lifecycle response
  values already include model and reasoning effort.
- `packages/happy-cli/src/codex/codexAppServerClient.ts`: start/resume/fork
  return seams currently drop confirmed effort.
- `packages/happy-cli/src/codex/runCodex.ts`: Session metadata publication and
  later route-change integration.

## Verification context

- Focused metadata, App Server, resume/fork, runtime, daemon projection, and
  launcher-parser fixtures named in the spec and task checklist.
- Final applicable Happy CLI and repository workflow commands.

## Notes

- External source: https://github.com/myartings/happy/issues/80
- Baseline: `origin/dev@8ecad0b722e535deba79b059d87d88bdc7f79f1a`.
- Existing untracked launch handoff is recovery evidence and is not part of the
  delivery candidate unless explicitly reconciled later.
