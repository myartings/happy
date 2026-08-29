---
name: decision-map
description: Identify and resolve project, architecture, research, prototype, or operational decisions before they become speculative requirements. Use when important choices remain unclear, sources conflict, or implementation would otherwise encode an unconfirmed assumption.
---

# Map Decisions

## Workflow

1. State the outcome that is blocked.
2. Challenge domain language only when the task changes the domain model,
   shared terminology, `CONTEXT.md`, or an architectural decision. Compare the
   proposed language with the glossary and code, sharpen overloaded terms, and
   probe concrete edge cases. Merely reading established vocabulary adds no
   modeling step.
3. When shared domain language is resolved, update the glossary in `CONTEXT.md`
   at that decision point. Keep implementation behavior in specs or architecture
   documents instead of the glossary.
4. List each decision independently. Persist it in `decisions.md` when a
   Trellis task is active; otherwise keep only decisions that meet a durable
   project-document threshold.
5. For every decision, record options, constraints, evidence required, owner,
   reversibility, and the cost of being wrong.
6. Route the smallest evidence-producing action: repository inspection, primary
   source research, user choice through `grilling`, or bounded throwaway
   prototype.
   When research or a prototype materially affects the decision, persist a
   small completion contract: question, source identity/input and date,
   conclusion, limits, and prototype disposal status. Ordinary factual lookup
   needs no research artifact, and a prototype is never production evidence.
7. Resolve decisions only when evidence supports a choice; record uncertainty.
8. Propagate accepted decisions into PRD, architecture, spec, or tasks. Offer an
   ADR only when all three are true:
   - **Hard to reverse** — changing the choice later has meaningful cost.
   - **Surprising without context** — a future maintainer would reasonably ask why.
   - **Real trade-off** — credible alternatives existed and evidence selected one.
9. For an active structured workflow, record the machine gate after the durable
   decision record is complete:

   ```bash
   python3 scripts/workflow-state.py gate active decisions passed \
     --evidence "docs/workspace/<slug>/decisions.md; docs/adr/<decision>.md"
   ```

   Use `blocked` instead of `passed` while a material decision remains open.

Do not hide decisions inside implementation tasks. Stop before coding when a
missing choice materially changes project behavior, architecture, risk, or scope.
