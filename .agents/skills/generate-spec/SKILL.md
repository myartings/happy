---
name: generate-spec
description: Create or update a detailed technical Feature Spec under docs/specs/ when accepted feature scope needs a durable implementation contract.
---

# Generate Feature Specification

1. Read the applicable PRD, context, ADRs, architecture, research, existing behavior, and tests.
2. Write the applicable sections from the Guide model: Overview, User Stories, Acceptance Criteria, Technical Design, Architecture, Data Models, API Endpoints, Dependencies, UI/UX Design, Edge Cases, Testing Plan, Rollout Plan, and Open Questions.
3. Adapt examples to the project's real stack. Omit sections that do not apply instead of filling them with placeholders.
4. Make acceptance criteria observable and connect them to the testing plan.
5. Preserve accepted technical choices and label unresolved decisions rather than inventing them.
6. Save the contract as `docs/specs/<feature>.md`.
7. When the accepted feature must leave this planning context, use `generate-tasks` to propose independently deliverable slices.

A Feature Spec is a detailed technical contract. It is not an implementation-neutral requirements document, Task checklist, or lifecycle record.
