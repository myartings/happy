# Testing Guidelines

Load this reference when test boundaries, mocking, or post-GREEN refactoring
need more detail than the core TDD loop.

## Behavior-first tests

Good tests:

- exercise behavior that callers or users care about;
- enter through a public interface;
- use real owned code paths where practical;
- describe what happens rather than how it is implemented;
- keep one logical behavior per test;
- survive renaming, extraction, or replacement of internal implementation.

Implementation-detail warning signs:

- testing private methods or internal data shape;
- asserting internal call counts, order, or collaborator wiring;
- breaking after a refactor that preserves observable behavior;
- bypassing the public interface to inspect storage or other internals.

## Boundary doubles

Prefer real owned collaborators. Mock or fake only a system boundary when the
real dependency would be unsafe, nondeterministic, unavailable, or impractical:

- external APIs and message transports;
- time, randomness, and environment-dependent values;
- file systems or databases when a real isolated resource is impractical;
- payment, email, device, or platform services.

Use dependency injection to expose these boundaries. Prefer narrow,
operation-specific interfaces over a generic client that forces conditional
logic into test doubles.

## Refactor candidates after GREEN

- Remove duplication.
- Deepen shallow modules behind smaller public interfaces.
- Move behavior toward the data it governs.
- Replace ambiguous primitives with domain values when evidence justifies it.
- Simplify newly exposed neighboring code without expanding accepted scope.

Rerun the focused test after each meaningful refactor and the nearest relevant
suite before leaving the TDD slice.
