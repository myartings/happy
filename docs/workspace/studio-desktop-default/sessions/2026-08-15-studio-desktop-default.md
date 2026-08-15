# Session: Studio Desktop Default

**Date**: 2026-08-15

**Branch / Worktree**: `fix/studio-desktop-default` / `studio-desktop-default`

**Scope**: diagnose and prevent fresh personal Tauri packages from presenting the
old Default visual system.

## Result

- Identified the two-part root cause: the central resolver honored a stored
  Default value, and the formal Tauri export did not embed Studio.
- Forced Studio for every Tauri runtime while preserving Default for non-Tauri
  clients and retaining the legacy setting schema.
- Added explicit cross-platform Studio export configuration and aligned dependent
  presentation tests with the new product contract.

## Evidence

- RED: five focused assertions failed on the old behavior.
- GREEN: 3 files / 29 focused tests; 17 files / 95 Studio tests.
- Regression: 139 files / 1256 Happy App tests.
- Happy App and Happy Server typechecks plus four workflow checks passed.
- Fresh Tauri build and a metadata-backed 1470x872pt runtime capture passed.
- Whole-diff review found no unresolved blocking/high/medium issue.

## Operational handoff

- The worktree bundle was launched separately and then closed; the installed app
  was not overwritten.
- After this commit reaches `dev`, use `devtools/happyctl refresh-desktop` for the
  canonical signed install and final user inspection.
