# Studio Activity Transcript Tasks

## T1 — Additive completion contract

Status: complete.

- Scope: Happy Wire and App session schemas plus compatibility tests.
- Outcome: legacy completion remains valid; optional bounded result/error
  metadata has a validated shape.
- Validation: focused Happy Wire and App raw-normalization tests.

## T2 — Codex result preservation

Status: complete.

- Depends on: T1.
- Scope: Codex completion mapper and its public behavior tests.
- Outcome: aggregated output, exit code, duration, and recognized status reach
  one enriched completion event; non-zero exit is an error.
- Validation: Codex mapper tests including large Unicode output and legacy
  completion behavior.

## T3 — App reducer integration

Status: complete.

- Depends on: T1, T2.
- Scope: normalizer/reducer result join and regression tests.
- Outcome: the matching `ToolCall` contains the real bounded result and correct
  completed/error state; legacy null-result completion is unchanged.
- Validation: envelope → normalized message → reducer output test.

## T4 — Studio semantic activity presentation

Status: complete.

- Depends on: T3.
- Scope: feature-local Studio activity tokens/resolver, actual ToolGroup/ToolView
  seams, and focused renderer tests.
- Outcome: packaged Studio distinguishes terminal/explore/edit/status roles and
  renders the preserved command output/duration; non-Studio paths remain exact.
- Validation: resolver and mounted renderer tests in light/dark/Default paths.

## T5 — Studio inline edit diff

Status: complete (visual acceptance tracked by T6).

- Depends on: T4.
- Scope: packaged-Tauri Studio Codex patch disclosure and surrounding hierarchy;
  reuse the existing `ToolDiffView`/Pierre renderer.
- Outcome: each valid structured file edit starts expanded with a compact
  path/kind/count row, remains collapsible, and shows the existing green/red
  unified diff without changing Default, standalone Web, iOS, or Android.
- Validation: mounted Studio and non-Studio renderer tests, complete App suite,
  independent review, and a fresh explicit-Studio package. macOS rejected the
  final explicit-window capture, so direct light/dark visual acceptance remains
  an integration item under T6 rather than an implementation claim.

## T6 — Integration verification and review

Status: complete; workflow closure awaits the configured check gate.

- Depends on: T1–T5.
- Run focused suites, App/CLI/Wire typechecks and complete applicable tests.
- Build packaged Studio and capture deterministic light/dark activity evidence.
- Obtain an independent producer-to-renderer whole-diff review.
- Finish and archive workflow evidence; do not commit or push unless authorized.

Final result: automated behavior, complete bounded suites, independent review,
a corrected explicit-Studio unsigned build, and direct user visual acceptance
all pass. The first capture remains invalid evidence because its export omitted
the Studio visual-mode environment flag. Finish/Archive remains guarded by the
configured check gate, whose only failure is the unchanged 1MB blob test at the
default 5-second timeout; the same complete App suite passes with the recorded
15-second bound.
