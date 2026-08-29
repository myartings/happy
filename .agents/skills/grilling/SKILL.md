---
name: grilling
description: Resolve material product, architecture, or plan uncertainty through Matt-style design-tree frontier rounds before committing to implementation.
---

# Frontier Grilling

## Protocol

1. Inspect the repository, project docs, tools, and available evidence first.
   Do not ask the user for facts that can be discovered safely.
2. Build a design tree: every unresolved decision branches into the decisions
   that depend on it.
3. Compute the frontier: every user-owned decision whose prerequisites are
   already settled and can therefore be answered without guessing.
   Independent factual research for other already-unlocked frontier nodes may
   run in parallel; it must not answer or bypass a user-owned choice.
4. Ask the whole frontier in one numbered round. For every question, present a
   recommended answer, its main trade-off, and only materially different
   alternatives. A question that depends on another answer in the same round
   belongs to a later round.
5. Wait for the user's answers, update the durable decision record, recompute
   the frontier, and repeat until it is empty.
6. For an active Trellis task, record accepted decisions in `decisions.md`.
   Otherwise keep the result in the current thread and propagate only genuinely
   durable product, architecture, domain, spec, or ADR decisions.
7. State the resulting shared understanding and do not act on it until the user
   confirms that the frontier is complete.

Finding facts is the Agent's job; use repository inspection or read-only
research rather than asking the user. Decisions belong to the user. Do not
implement while a material choice remains unresolved or before the final shared
understanding is confirmed.
