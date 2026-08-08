---
name: tdd
description: Develop observable behavior through focused, public-interface red-green-refactor tracer bullets. Use for features or bug fixes with a stable automated test seam, especially core logic, state transitions, parsers, data transformations, and regressions.
---

# Test-Driven Development

## Contract

Test behavior through the narrowest public interface that matters to a caller.
Prefer integration-style coverage of real code paths. Tests must describe what
the system does and survive internal refactoring; do not couple them to private
methods, owned collaborators, call order, or internal data shape.

## Before RED

1. Select one prioritized acceptance behavior from the active contract.
2. Identify the public seam and the exact targeted command that can prove it.
3. Confirm the test can fail meaningfully before production behavior changes.
4. If no stable automated seam exists, record another deterministic feedback
   signal in `validation.md` instead of fabricating a test or a RED result.
5. Read [testing guidelines](references/testing-guidelines.md) only when a seam,
   boundary-double, or refactor tradeoff needs more detail than these core
   guardrails provide.

## Tracer-Bullet Loop

For one tracer bullet at a time:

1. **RED** — Write one focused behavior test, run the targeted command, and
   confirm it fails for the intended missing behavior rather than setup drift.
2. **GREEN** — Implement only enough production behavior to pass that test.
3. Run the targeted test, then the nearest relevant suite.
4. Repeat RED → GREEN for the next acceptance behavior; work vertically and keep
   to one test at a time instead of writing a horizontal batch of imagined tests.
5. **REFACTOR** — Improve design only while tests remain green, rerunning the
   targeted test after every meaningful refactor.
6. Record exact RED, GREEN, suite, and refactor outcomes in workflow
   `validation.md`.

## Guardrails

- Mock only at system boundaries such as external services, time, randomness,
  or an impractical real data store. Do not mock the unit under test or internal
  modules that the repository owns.
- Never refactor while RED. Restore GREEN before changing structure.
- Do not add speculative behavior for future tests.
- If RED fails for an unexpected reason or repeated GREEN attempts fail, stop
  and route to `diagnose` with the observed evidence.

## Completion

- Every in-scope behavior is covered or has an explicit alternative signal.
- Targeted tests and the nearest complete applicable suite pass.
- Tests use public behavior and remain insensitive to internal refactoring.
- Commands and results are recorded in the active workflow evidence.
