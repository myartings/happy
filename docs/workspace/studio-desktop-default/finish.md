# Finish Review: `studio-desktop-default`

## Summary

- Personal packaged Tauri now resolves Studio unconditionally, so old device
  settings and stale preview values cannot restore the upstream appearance.
- The old enum and Default render paths remain for backward compatibility and
  non-Tauri clients.
- Tauri's production frontend export now explicitly embeds Studio with
  cross-platform `cross-env` and clears the Expo cache.

## Verification

- Focused final policy suite: 3 files / 29 tests passed.
- Studio presentation suite: 17 files / 95 tests passed.
- Final Happy App suite: 139 files / 1256 tests passed.
- Happy App and Happy Server typechecks passed through `workflow-check`.
- Four configured workflow checks passed.
- Fresh unsigned development bundle built successfully from this worktree; its
  build log showed the exact Studio export command.
- A separately launched worktree bundle rendered the Studio shell at 1470x872pt;
  its lossless screenshot and validated evidence record are stored under
  `/Users/myartings/Sync/tmp/happy-studio-desktop-default-2026-08-15/`.

## Whole-diff review

- Passed with no blocking, high, or medium finding.
- Traced all central resolver consumers, confirmed non-Tauri fail-closed behavior,
  checked legacy setting parsing, and verified there is no visual-style setter.
- Corrected stale test descriptions that still implied a preview override.

## Rollback or mitigation

- Revert this atomic change to restore persisted style selection.
- Default renderer branches and the legacy enum remain in source, so rollback
  does not require reconstructing deleted UI or migrating stored data.
- The verified worktree bundle did not overwrite `/Applications/Happy (dev).app`.

## Lessons promoted

- `CONTEXT.md`: none; the rule is personal-product-specific and already captured
  by the feature contract.
- Architecture or ADR: none; no reusable architecture boundary changed.
- Skill/workflow rule: none; this was a product-selection and packaging defect,
  not a missing general workflow rule.

## Follow-up

- After integration into `dev`, run canonical `devtools/happyctl refresh-desktop`
  to sign, back up, replace, and launch `/Applications/Happy (dev).app`.
- Develop future Codex-inspired UI features from this integrated Studio-default
  baseline in independent worktrees.
