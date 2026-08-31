# Scoping: `codex-first-happy-client-latest-dev-refresh`

## Classification

- Intensity: `feature`.
- Result: `ready` after acceptance, decision, risk, and scoping receipts.
- Owner/topology: current human-facing Root, serial `current-root`; overlapping
  component and projection files are one integration unit, so no independent
  writer or batch is safe.
- Capability: current Root is sufficient; conflict semantics and review remain
  Root judgment boundaries.
- Risk: `not_required`; this is App presentation/navigation integration with
  zero new response RPC, protocol, auth, migration, protected-path, install, or
  release behavior.

## Pinned inputs

- First parent: `ddb3034e2e3006b9b70f1e38d6cced99cdef1de0`.
- Second parent: `87b5385e82d96b5eaab68bc65a968cf36167e9c5`.
- Shared integration base: `68cfb6f915fb25f5ecd444df2aefafeccae92fa8`.
- Predicted conflicts: the four paths listed in `context.md`.

## Test authority and implementation sequence

1. Merge the pinned second parent with `--no-commit --no-ff`.
2. Resolve archive and import conflicts as exact unions. Resolve the list
   implementation initially to incoming current-request semantics.
3. Run the existing `promotes Agent input requests alongside permission
   requests` test and require the intended RED.
4. Implement the smallest compatibility rule from D4, rerun the focused test,
   the whole visible-list test file, current-request/navigation focus tests,
   Codex-first tests, and App typecheck.
5. Run the complete applicable candidate check, Windows non-install signals,
   scans, independent review, finish/archive, staged CI, merge commit,
   committed CI, normal push, and PR verification.

## Scope containment

- Accepted source changes are limited to the four conflict resolutions and a
  focused integration repair in the visible-list public seam if RED proves it.
- Auto-merged PR #76 files are inspected and tested but are not rewritten
  without an integration-only failure.
- Material growth follows
  `docs/workflow/discovered-work-scope-containment.md`; protected paths, new
  protocol behavior, unrelated baseline repair, installation, and release are
  excluded.
