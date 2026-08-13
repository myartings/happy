# Studio Semantic Text Tasks

## Dependency map

```text
T1 semantic contract ─┬─> T2 ANSI parser ─> T3 adversarial/boundary tests
                      └─> T4 fixtures/demo states

Studio checkpoint ───────> T5 theme/component integration ─> T6 visual acceptance

T1-T4 may run now. T5-T6 wait for the committed Studio checkpoint in dev.
```

## T1 — Semantic role contract

- Status: completed on 2026-08-12.

- Scope: add a platform-neutral type/model for the semantic categories in the
  accepted spec.
- Allowed area: a new self-contained module and focused tests under
  `packages/happy-app/sources/`; do not edit `theme.ts`, `unistyles.ts`, visual
  style settings, or shared theme registration.
- Dependencies: none.
- Acceptance: AC1; role names do not import or encode concrete Studio colors.
- Validation: focused unit tests and `pnpm --filter happy-app typecheck`.

## T2 — Pure ANSI SGR parser

- Status: completed on 2026-08-12.

- Scope: convert text into readable plain text and semantic runs using only the
  SGR display subset in the spec.
- Allowed area: the self-contained semantic-text module and its tests.
- Dependencies: T1 and the risk controls in the spec/decisions.
- Acceptance: AC2; no shell, PTY, network, filesystem, clipboard, or link action.
- Validation: focused parser tests.

## T3 — Adversarial and resource-boundary coverage

- Status: completed on 2026-08-12.

- Scope: malformed/truncated sequences, cursor and erase controls, OSC 8/52,
  repeated resets, long inputs, and adjacent-run compaction.
- Dependencies: T2.
- Acceptance: AC3 and AC4.
- Validation: focused deterministic tests; record input/output bounds.

## T4 — Deterministic semantic fixtures

- Status: completed on 2026-08-12.

- Scope: representative Markdown, command, path, status, numeric, ANSI, and
  mixed-content fixtures suitable for component tests and later screenshots.
- Dependencies: T1; T2 for ANSI fixtures.
- Acceptance: fixtures cover each semantic category without importing the
  unfinished Studio theme.
- Validation: fixture/parser tests and snapshot inspection where stable.

## T5 — Studio theme and component integration

- Status: completed for this branch's bounded integration batch on 2026-08-13.

- Scope: after the committed Studio checkpoint reaches `dev`, merge `dev`,
  reconcile stable semantic token names, and map Markdown plus structured
  conversation text in packaged macOS/Windows Studio mode.
- Shared files: identify after reinspection; coordinate ownership before edits.
- Dependencies: T1-T4 and committed Studio checkpoint.
- Acceptance: AC5, AC6, and AC7.
- Validation: Markdown/component tests, resolver/platform tests, Happy app
  typecheck, and relevant full test suite.
- Implemented boundary: Markdown body/headings/emphasis/link/inline-code,
  fenced-code presentation, command-chip metadata, and agent-event status text.
  The semantic palette also defines command/path/number/success/warning/error
  roles for subsequent tool-text consumers. Tool shells were intentionally not
  edited because the parallel overlay/tool ownership boundary was not explicit.

## T6 — Desktop visual acceptance

- Scope: run matched Codex/Happy capture, comparison, repair, and human review.
- Dependencies: T5 and runnable packaged macOS/Windows clients.
- Acceptance: AC8 plus all material P0/P1 Codex-reference differences resolved
  or explicitly accepted.
- Validation: project-local `desktop-visual-match` evidence and representative
  screenshot review.
- Status: delegated to the parent Studio integration session. This child branch
  must not claim visual parity or user acceptance.

## Integration and finish

- Run the configured workflow checks, focused Happy app tests, typecheck, and a
  bounded whole-diff review.
- This child workflow may archive after T5 code verification and review because
  T6 is owned by the parent integration workflow. The parent must keep AC8 open
  until matched screenshots receive human review.
