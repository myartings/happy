---
name: diagnose
description: Diagnose build, test, runtime, integration, or behavioral failures from evidence before applying fixes. Use when root cause is unknown, an attempted fix failed, symptoms cross boundaries, or the same problem has recurred.
---

# Diagnose Failure

## Workflow

1. Reproduce the smallest reliable symptom and capture the exact command/output.
2. Distinguish observed facts from assumptions.
3. Trace the failing path across inputs, state, boundaries, and outputs.
4. Form a small set of falsifiable hypotheses ordered by likelihood and cost.
5. Run the cheapest discriminating experiment for the leading hypothesis.
6. Identify root cause before patching; if evidence remains ambiguous, state it.
7. Add a regression test or equivalent signal, then implement the narrow fix.
8. Re-run the original reproduction and nearby regression checks.

After three unsuccessful fix attempts, stop editing, summarize evidence and
failed hypotheses, raise reasoning/risk level, and request a fresh review.
