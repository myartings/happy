# Tasks: Preserve Launch-Pinned Codex Route

## Slice boundary

One independently deliverable Issue #99 Slice. The App resolver change, CLI
retention evidence, and projection regression evidence are reviewed and rolled
back together.

## T1 — Freeze outbound metadata behavior

- Scope: add RED tests for complete, missing, and partial effective-route pairs
  plus explicit model-only, effort-only, and pair selections.
- Likely files: `packages/happy-app/sources/sync/messageMeta.test.ts`.
- Dependencies: accepted Spec AC1, AC4-AC8.
- Ownership: current Root; serial.
- Parallel candidate: no; T2 consumes the exact failing cases.
- Acceptance: tests prove unchanged routes omit fields, explicit fields remain,
  and incomplete or malformed evidence keeps legacy defaults.
- Validation: focused Vitest for `messageMeta.test.ts`.

## T2 — Implement complete-pair route preservation

- Scope: update the shared non-Rig Codex message-mode resolver only.
- Likely files: `packages/happy-app/sources/sync/messageMeta.ts`.
- Dependencies: T1 RED evidence.
- Ownership: current Root; serial.
- Parallel candidate: no.
- Acceptance: smallest resolver change makes T1 green without changing
  permission, service-tier, Rig, or non-Codex behavior.
- Validation: focused resolver suite and Happy App typecheck.

## T3 — Lock the CLI retention and projection seam

- Scope: add or refine focused tests proving absent fields preserve launch
  Luna/Max, individual explicit fields update independently, and the actual
  App Server thread/turn requests plus effective daemon projection remain
  Luna/Max.
- Likely files:
  `packages/happy-cli/src/codex/__tests__/remoteModeState.test.ts`; existing
  runtime metadata and daemon projection fixtures for verification.
- Dependencies: T1/T2 metadata contract.
- Ownership: current Root; serial.
- Parallel candidate: no; same acceptance seam and final candidate.
- Acceptance: AC2 and AC3 have one candidate-bound deterministic fixture using
  the production route mapping, App Server client wire, settings-event mapping,
  and daemon projection helper.
- Validation: focused Happy CLI Vitest files.

## T4 — Integrate and verify the Slice

- Scope: complete acceptance mapping, applicable checks, independent dual-axis
  review, remediation, finish, and archive preparation.
- Dependencies: T1-T3 green.
- Ownership: current Root with independent read-only reviewers at review gate.
- Parallel candidate: review axes only, as required by the review workflow.
- Acceptance: AC1-AC8 mapped to passing evidence; no out-of-scope launcher or
  tracker mutation.
- Validation: `python3 scripts/workflow-check.py --applicable`, workflow audit,
  pinned Spec/Standards review, and staged workflow CI before authorized
  delivery.
