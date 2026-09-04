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
   Close research with an explicit disposition when it materially changes a
   project decision, produces a durable follow-up Slice, crosses a real session
   boundary, or the user explicitly requests preservation. Elapsed time is not
   a trigger. Ordinary factual lookup, transient source browsing, and
   inspection with no material finding need no report, Workspace, receipt, or
   closeout ceremony, and a prototype is never production evidence.
   For a triggered disposition:
   - name the exact durable repository path, recoverable revision, Issue URL,
     or approved knowledge-base destination that contains the completion
     contract; or
   - state that the result is not yet durable, why it could not be persisted,
     and the narrowest proposed destination or authorization needed.
   A read-only request performs no repository, tracker, or knowledge-base
   write; material output therefore uses the pending disposition unless an
   exact durable reference already exists. Do not describe chat text, temporary
   handoffs, untracked files, or local-only artifacts without a recoverable
   covering revision as durable archives.
   Keep the completion contract small: question, source identity/input and
   date, conclusion, limits, and prototype disposal status when applicable.
   Do not save full transcripts, copied source pages, or raw search output.
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
