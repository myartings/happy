# Finish Review: `studio-panel-resize-joint-projection`

## Summary

Replaced independent host projection against persisted opposite targets with a
shared deterministic pair projection. At 1200pt with stored 420/520 and both
visible, actual widths are 261/339, consuming the safe 600pt panel budget while
preserving 600pt for conversation. Reset writes intrinsic 275/360 targets and
the same joint policy renders their containable narrow-window pair.

## Verification

- RED: 6 intended failures proved missing pair projection, stale host wiring,
  and reset's dependency on opposite geometry.
- Focused final: 5 files / 29 tests passed.
- Happy App typecheck passed.
- Complete Happy App: 135 files / 1199 tests passed.
- Workflow checks: 4 commands / 0 failures.
- Strict audit and `git diff --check` passed before finish.

## Whole-diff review

Passed with no blocking findings. Joint allocation preserves side bounds,
protects the 600pt main reserve when feasible, distributes constrained default
space deterministically, and uses ordinary single-side projection when either
panel is collapsed. Both hosts consume the same actual pair. Studio/Tauri
activation, device-local stored targets, panel callbacks, and all non-Studio
fallbacks are unchanged.

## Rollback or mitigation

Revert the incremental commit to return to `d1a040bd`. No schema or stored-data
migration is involved; existing persisted targets remain valid under either
policy.

## Lessons promoted

- `CONTEXT.md`: none; bounded feature correction.
- `docs/ARCHITECTURE.md` or ADR: none.
- Skill/workflow rule: none; existing TDD/review loop exposed the coordination
  defect before packaged acceptance.

## Follow-up

Parent cherry-picks this commit after `d1a040bd`, reruns integrated checks, and
visually verifies 1200pt/1470pt dual-panel defaults, drag, reset, and
collapse/reopen in the packaged macOS client.
