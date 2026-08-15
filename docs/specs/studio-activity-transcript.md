# Studio Activity Transcript

## Problem

Codex app-server command completion already supplies aggregated output, exit
code, duration, status, command, and working directory. Happy currently maps
that completion to a `tool-call-end` event containing only the call id, so the
app cannot render the real result. Existing activity grouping also classifies
terminal, read/search, and edit tools correctly, but Studio does not yet give
those semantic types and their states a coherent visual hierarchy.

## Scope

- Extend the existing session `tool-call-end` event with optional, bounded
  result and error metadata.
- Preserve real Codex command output, exit code, duration, and completion state
  through the CLI mapper, wire schema, App normalizer, reducer, and existing
  Studio execution transcript.
- Add packaged-Tauri Studio-only activity presentation for terminal,
  read/search, edit, task/web/other, running, completed-category, and error rows.
- Reuse the existing grouping, labels, navigation, permission, ANSI, and Pierre
  diff parser/renderer. In packaged-Tauri Studio only, make structured file-edit
  diffs immediately visible with a compact file disclosure row; preserve the
  existing collapsed disclosure elsewhere.

## Compatibility contract

- `tool-call-end` with only `t` and `call` remains valid and normalizes to the
  existing completed tool with a null result.
- New result fields are optional. Producers that do not know them and consumers
  receiving old history require no migration.
- Codex output is bounded before it enters the session envelope. Truncation must
  preserve valid UTF-16 boundaries and be explicitly visible in the result.
- Unknown or malformed status/exit metadata cannot fabricate success or output.
- Default, standalone Web, iOS, and Android retain their current renderer and
  styling. Only packaged Tauri with Studio selected consumes new visual tokens.
- Permission resolution, tool execution, command invocation, storage joins,
  navigation, and diff parsing remain unchanged. Default, standalone Web, iOS,
  and Android retain the existing collapsed file disclosure behavior.

## Observable behavior

1. A completed Codex command with output produces one matching tool call whose
   result contains that output plus available exit code, duration, and status.
2. A non-zero exit code produces an error tool result; a zero exit code produces
   a completed result. Missing exit code preserves the provider completion
   status when it is recognized, otherwise it remains a non-error completion.
3. Empty output remains empty; the UI does not invent `Command completed` text.
4. Studio execution transcript prefers provider duration metadata when present
   and otherwise uses existing timestamps.
5. Safe ANSI parsing, selection, copy, CJK/Unicode handling, and output bounds
   remain active for the newly preserved result.
6. Studio activity groups and rows use restrained semantic color for terminal,
   explore/read/search, edit/diff, task, neutral, running, and failure roles.
   Completed rows retain their category color instead of becoming uniformly
   green. Ordinary
   prose and non-Studio paths stay neutral.
7. Existing localized `Ran`, `Read`, `Edited`, search, web, task, and fallback
   labels remain authoritative; this feature does not fork localization.
8. A structured Studio file edit shows its unified diff on first render. The
   compact file row exposes the resolved path, edit kind, and addition/deletion
   counts; additions and deletions retain the existing diff renderer's green and
   red line backgrounds. The row still toggles the diff closed and open, and
   permission content remains attached to the final file entry.

## Edge cases

- Legacy completion with no result fields.
- Empty output, output containing ANSI/control sequences, CR progress, CJK,
  emoji, combining characters, and a surrogate pair at the truncation boundary.
- Non-zero, zero, null, string-like, or malformed exit metadata.
- Command completion arriving before or after permission reconciliation.
- Very large aggregated output.
- Mixed-category activity groups and unknown future tool names.
- Added, deleted, moved, and modified files; multiple changed files; empty or
  malformed patch entries; permission footer attached to the final entry.

## Acceptance criteria

- **AC1:** Happy Wire and App schemas accept both legacy and enriched
  `tool-call-end` events; malformed enriched fields fail closed.
- **AC2:** A real Codex `exec_command_end` maps output, exit code, duration, and
  status into one bounded enriched completion event; non-zero exit is marked as
  error and legacy mapper behavior remains valid for other providers.
- **AC3:** App normalization and reducer integration preserve enriched result
  data on the matching `ToolCall`, with an end-to-end public-behavior test from
  session envelope through displayed message state.
- **AC4:** Studio execution transcript renders received output and provider
  duration, including error state, without fabricating absent content.
- **AC5:** Studio activity presentation exposes distinct semantic tokens for
  terminal, explore, edit, task, neutral, running, and failure and is wired
  into actual group/row rendering.
- **AC6:** Default, standalone Web, iOS, Android, permissions, navigation,
  collapse, localization, ANSI safety, and Pierre diff behavior remain
  unchanged.
- **AC7:** Focused CLI/Wire/App tests, typechecks, complete applicable suites,
  strict workflow checks, independent whole-diff review, and packaged Studio
  light/dark evidence pass before completion is claimed.
- **AC8:** A mounted packaged-Studio Codex patch renders its real unified diff
  immediately with file identity and green/red addition/deletion semantics,
  remains user-collapsible, and preserves the permission footer. The same
  mounted tool stays initially collapsed when Studio is not selected.

## Risk controls

- Optional additive fields only; no event rename or required-field migration.
- Bound output before sync and render, with explicit truncation marker.
- Treat exit status structurally; never parse prose for success.
- Add compatibility tests for old producers and old stored history.
- Independent review must trace producer → schema → normalizer → reducer → UI.
- Rollback is a single additive protocol/UI feature commit; legacy events remain
  the fallback contract.

## Accepted uncertainty

- Codex aggregated output may combine stdout and stderr. Happy preserves it as
  provider output and does not claim stream separation that the event lacks.
- Historical sessions cannot gain output that was already discarded.
- Exact Codex Desktop private colors remain unavailable; Studio tokens are
  calibrated from accepted local visual evidence.
- The existing Pierre renderer remains authoritative for diff parsing, syntax
  highlighting, line wrapping, and theme-specific line backgrounds; this
  feature changes transcript disclosure and surrounding hierarchy, not the diff
  grammar or patch data contract.
