# Tasks: Publish Launch-Pinned Codex Effort

## Slice boundary

One independently deliverable Issue #103 Slice. The App Server launch-effort
configuration, eager no-turn thread creation, authority publication, and cold
path regression evidence are reviewed and rolled back together.

## T1 — Freeze App Server launch configuration

Status: complete.

- Scope: add RED coverage proving a launch effort reaches supported thread
  configuration and that `thread/start` returns the only publishable pair.
- Likely files: `packages/happy-cli/src/codex/codexAppServerClient.test.ts`.
- Dependencies: accepted Spec AC1, AC3, AC6.
- Ownership: current Root; serial.
- Parallel candidate: no; T2 consumes the exact failing contract.
- Acceptance: Luna/Max is present at the App Server configuration boundary;
  thread creation emits no turn or user input.
- Validation: focused App Server client Vitest cases.

## T2 — Support launch effort in thread creation

Status: complete.

- Scope: extend the thread-start configuration builder/API with an optional
  reasoning effort while preserving MCP configuration and resume/fork defaults.
- Likely files: `packages/happy-cli/src/codex/codexAppServerClient.ts` and its
  focused tests.
- Dependencies: T1 RED evidence.
- Ownership: current Root; serial.
- Parallel candidate: no.
- Acceptance: the smallest API change makes T1 green and does not change
  turn-start, resume, fork, or missing-effort behavior.
- Validation: focused App Server client suite and CLI typecheck.

## T3 — Establish and publish the fresh thread before message wait

Status: complete after second-review remediation, including actual `runCodex()`
cold-path evidence, terminal metadata-rejection classification, and offline
hot-reconnection gating until a real Session is available. Fourth-review
remediation adds typed authentication/cancellation settlement, pre-resource
cleanup ownership, and actual untouched Luna/Max first-turn coverage.

- Scope: add RED orchestration coverage, eagerly start a new non-resume/non-fork
  thread after App Server connection, then atomically update Session metadata
  and daemon projection before entering the message loop.
- Likely files: `packages/happy-cli/src/codex/runCodex.ts` plus the narrowest
  extracted/testable cold-start helper or orchestration test.
- Dependencies: T2 and existing Issue #80/#99 metadata helpers.
- Ownership: current Root; serial.
- Parallel candidate: no; it shares production seams and acceptance evidence.
- Acceptance: AC1-AC7, including no inference, one thread, untouched first turn,
  explicit route transition, and failure without false authority.
- Validation: focused cold-path, runtime metadata, remote-mode, daemon, and App
  Server tests; CLI typecheck.

## T4 — Integrate and verify the Slice

Status: in progress; fresh final check and dual-axis review pending.

- Scope: complete acceptance mapping, applicable structured checks, independent
  dual-axis review, remediation, finish, and terminal archive preparation.
- Dependencies: T1-T3 green.
- Ownership: current Root with independent read-only review axes.
- Parallel candidate: review axes only, as required by the review workflow.
- Acceptance: AC1-AC8 mapped to passing evidence; no downstream launcher,
  tracker mutation, commit, push, PR, or client installation.
- Validation: `python3 scripts/workflow-check.py --applicable`, workflow audit,
  pinned Spec/Standards review, and staged workflow CI before authorized delivery.
