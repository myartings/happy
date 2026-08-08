---
name: generate-spec
description: Write or update an implementation-neutral, verifiable feature contract under `docs/specs/`. Use after project scope is accepted, before non-trivial implementation, or when behavior, interfaces, edge cases, and verification need a durable agreement.
---

# Generate Spec

## Workflow

1. Read the applicable PRD, architecture, decisions, existing behavior, and tests.
2. Define one coherent feature boundary and its non-goals.
3. Specify observable behavior, interfaces/data, state transitions, errors, edge
   cases, compatibility, and operational constraints.
4. Write acceptance criteria as individually verifiable statements.
5. Map every criterion to a planned test, command, or inspection signal.
6. Record accepted uncertainty explicitly; do not invent missing facts.
7. Save to `docs/specs/<slug>.md` and link it from workflow state.
8. Route accepted specifications to `generate-tasks`.

Keep implementation choices out unless they are accepted architectural contracts.
