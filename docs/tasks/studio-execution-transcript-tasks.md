# Studio Execution Transcript Tasks

## Batch 0 — contracts and fixtures

- [x] Record reference precedence, compatibility boundary, accepted uncertainty,
  edge cases, and acceptance-to-evidence mapping.
- [x] Inventory actual Codex, Claude, and Gemini shell tool input/result shapes
  already supported by Happy; do not invent protocol fields.
- [x] Add deterministic command/output fixtures covering light/dark, 16/256/RGB
  ANSI, reset, malformed controls, CJK, emoji, tabs, long paths, and failures.

## Batch 1 — safe transcript model

- [x] Convert received shell tool data into a feature-local, read-only transcript
  presentation model without changing protocol or persistence.
- [x] Extend the existing ANSI parser only for accepted missing behaviors and
  map safe runs to Studio light/dark presentation tokens.
- [x] Prove stripped readable/copy text and control-sequence safety through the
  public resolver/parser seam.

## Batch 2 — real Studio renderer

- [x] Render structured command, cwd, output, and status for real shell
  tools in packaged Studio.
- [x] Preserve callbacks, permission footer, navigation, selection/copy, compact
  setting, and every non-Studio renderer path.
- [x] Coordinate status and existing Pierre diff colors without replacing diff
  parsing or changing tool execution.

## Integration and acceptance

- [x] Run focused public-behavior tests, App typecheck/full applicable suite,
  workflow validators, diff check, and whole-diff review.
- [x] Build/install packaged Studio and capture the launch state; matched light/dark command,
  success, failure, ANSI, long-line, CJK, and diff-adjacent states.
- [x] Record the unavailable automated light/dark fixture navigation and its
  consequence without manufacturing session data; user accepted this named gap
  by explicitly requesting commit and push on 2026-08-14.
- [x] Present the complete batch for user acceptance; publish only after the
  user's explicit commit-and-push instruction.
