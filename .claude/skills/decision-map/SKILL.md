---
name: decision-map
description: Identify and resolve project, architecture, research, prototype, or operational decisions before they become speculative requirements. Use when important choices remain unclear, sources conflict, or implementation would otherwise encode an unconfirmed assumption.
---

# Map Decisions

## Workflow

1. State the outcome that is blocked.
2. List each decision independently in the active workflow's `decisions.md`.
3. For every decision, record options, constraints, evidence required, owner,
   reversibility, and the cost of being wrong.
4. Route the smallest evidence-producing action: repository inspection, primary
   source research, user choice through `grilling`, or bounded throwaway
   prototype.
5. Resolve decisions only when evidence supports a choice; record uncertainty.
6. Propagate accepted decisions into PRD, architecture, spec, tasks, or an ADR.
7. For an active structured workflow, record the machine gate after the durable
   decision record is complete:

   ```bash
   python3 scripts/workflow-state.py gate active decisions passed \
     --evidence "docs/workspace/<slug>/decisions.md; docs/adr/<decision>.md"
   ```

   Use `blocked` instead of `passed` while a material decision remains open.

Do not hide decisions inside implementation tasks. Stop before coding when a
missing choice materially changes project behavior, architecture, risk, or scope.
