---
name: tdd
description: Develop observable behavior through focused, public-interface RED-to-GREEN tracer bullets. Use for features or bug fixes with a stable automated test seam, especially core logic, state transitions, parsers, data transformations, and regressions.
---

# Test-Driven Development

## Contract

Test behavior through the narrowest public interface that matters to a caller.
Prefer integration-style coverage of real code paths. Tests must describe what
the system does and survive internal refactoring; do not couple them to private
methods, owned collaborators, call order, or internal data shape.

## Before RED

1. Select one prioritized acceptance behavior from the active contract.
2. Establish an agreed public seam and the exact targeted command that can prove
   it. An accepted contract or tracker item that explicitly names the seam is
   already agreement; otherwise propose the seam and wait only for that
   unresolved choice.
3. Name an independent expectation source: an accepted contract, known fixture,
   reference implementation, or calculation performed outside production
   logic. Reject tautologies and expected values derived from the implementation
   under test.
4. Confirm the test can fail meaningfully before production behavior changes.
5. If no stable automated seam exists, name another deterministic feedback
   signal instead of fabricating a test or RED result. Persist it in
   `validation.md` only for an active Trellis task.
6. Read [testing guidelines](references/testing-guidelines.md) only when a seam,
   boundary-double, or refactor tradeoff needs more detail than these core
   guardrails provide.

## Tracer-Bullet RED-to-GREEN Loop

For one tracer bullet at a time:

1. **RED** — Write one focused behavior test, run the targeted command, and
   confirm it fails for the intended missing behavior rather than setup drift.
2. **GREEN** — Implement only enough production behavior to pass that test.
3. Run the targeted test, then the nearest relevant suite.
4. Repeat RED → GREEN for the next acceptance behavior; work vertically and keep
   to one test at a time instead of writing a horizontal batch of imagined tests.
5. Record exact RED, GREEN, and suite outcomes; persist them in task
   `validation.md` only when a Trellis task is active.

## Local refinement boundary

Pinned Matt places refactoring in its code-review stage, outside TDD. This
repository's independent formal review is read-only, so moving code changes into
that gate would violate review independence. As a documented local conflict,
any necessary design refinement is a separate accepted implementation action
after GREEN and before formal review. Keep tests green, rerun the targeted test
after every meaningful change, and record the result separately from behavioral
RED/GREEN evidence.

## Guardrails

- Mock only at system boundaries such as external services, time, randomness,
  or an impractical real data store. Do not mock the unit under test or internal
  modules that the repository owns.
- Never refactor while RED or inside the RED-to-GREEN loop.
- Do not add speculative behavior for future tests.
- If RED fails for an unexpected reason or repeated GREEN attempts fail, stop
  and route to `diagnose` with the observed evidence.

## Completion

- Every in-scope behavior is covered or has an explicit alternative signal.
- Targeted tests and the nearest complete applicable suite pass.
- Tests use public behavior and remain insensitive to internal refactoring.
- Commands and results are reported exactly; active tasks also persist them in
  workflow evidence.
