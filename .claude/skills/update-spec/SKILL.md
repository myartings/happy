---
name: update-spec
description: Promote reusable, evidenced learning into durable repository guidance. Use after repeated bugs, finish reviews, architecture decisions, workflow failures, or discoveries that future coding sessions should consistently know.
---

# Update Project Guidance

## Workflow

1. Identify the concrete evidence and recurrence risk behind the learning.
2. Choose the narrowest durable destination:
   - `CONTEXT.md` for shared language and stable boundaries.
   - `docs/ARCHITECTURE.md` or an ADR for architectural decisions.
   - `.ai/project.json` for real commands, paths, or risk triggers.
   - A skill for repeatable procedural behavior.
   - Tests, lint, or CI for rules that can be deterministic.
3. Search for an existing rule before adding a new one.
4. Patch incrementally and preserve provenance or reversal conditions.
5. Validate affected skills/configuration and record the promotion in `finish.md`.

Do not promote one-off debugging details, temporary reminders, speculative advice,
or rules that are already enforced deterministically elsewhere.
