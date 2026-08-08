---
name: grilling
description: Resolve material product, architecture, or plan uncertainty through a focused one-decision-at-a-time interview before committing to implementation.
---

# Focused Grilling

## Protocol

1. Inspect the repository, project docs, tools, and available evidence first.
   Do not ask the user for facts that can be discovered safely.
2. Build the decision tree privately and identify the smallest unresolved choice
   that blocks the desired outcome.
3. Ask exactly one decision question at a time.
4. Present the recommended answer first, explain its main trade-off, and offer
   only the alternatives that materially change the result.
5. Wait for the user's answer before advancing to the next dependent choice.
6. Record accepted decisions in the active workflow's `decisions.md` and
   propagate them to the PRD, spec, tasks, architecture, or ADR as appropriate.
7. Stop grilling when the remaining uncertainty is non-blocking and state the
   resulting shared understanding.

Decisions belong to the user. Do not implement while a material choice remains
unresolved, and do not turn a multi-question checklist into a single message.
