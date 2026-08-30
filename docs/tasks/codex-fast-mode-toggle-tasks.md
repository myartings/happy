# Codex Fast Mode Toggle Tasks

Status: completed on `2026-08-30`; the user accepted the named verification
gaps recorded in the workflow validation report.

## T1 — Shared session and message contract

- Scope: add optional `serviceTier` to app/CLI message schemas, session mirrors,
  metadata patching, reconciliation, and capability metadata.
- Dependencies: accepted spec and decisions.
- Acceptance: AC2 and the contract portion of AC3.
- Validation: focused schema, storage, reducer, and ops tests.

## T2 — App selection and composer control

- Scope: mark supported Codex models, resolve effective Standard/Fast state,
  normalize unsupported model changes, and add accessible desktop/mobile
  composer controls.
- Dependencies: T1.
- Acceptance: AC1, AC2, AC6.
- Validation: model option, presentation, SessionView wiring, and component
  structure tests.

## T3 — CLI validation and Codex transport

- Scope: extend remote Codex mode state, queued turn mode, and generated-protocol
  subset so validated tiers reach `turn/start.serviceTier`.
- Dependencies: T1.
- Acceptance: AC3, AC4, AC5.
- Validation: remoteModeState, prompt/queue as applicable, and
  codexAppServerClient focused tests.

## T4 — Integration verification

- Scope: run focused suites, app/CLI typechecks, workflow checks, and whole-diff
  review; record exact results and remaining runtime gaps.
- Dependencies: T2 and T3.
- Acceptance: all criteria.
- Validation: commands in `.ai/project.json` plus closest package checks.
