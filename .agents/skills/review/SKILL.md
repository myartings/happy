---
name: review
description: Run Matt-owned two-axis Spec and Standards review of one final checked candidate in separate parallel read-only contexts. Use after the applicable final deterministic check, or when the user asks for review.
---

# Two-Axis Review

## No-task review

Pin the whole Git diff and dispatch Spec and Standards as separate parallel
read-only contexts. Keep findings and rankings separate. No-task review creates
no Workspace evidence. If both contexts cannot run, report review unavailable;
Root self-review is not a substitute.

## Accepted-task workflow

1. Require a passed candidate-bound final check. Pin the comparison point and
   stage only the accepted
   delivery and generate temporary shared input with
   `python3 scripts/workflow-review.py package <slug> --base <ref> --staged`.
   The package lives under Git-private storage, outside the committed candidate.
2. Give both clean-context reviewers the same package. Spec reads the accepted
   Issue/local source, PRD/spec, decisions, checklist, and acceptance coverage.
   Standards reads repository instructions, architecture, engineering rules,
   protected boundaries, test policy, and
   [the smell baseline](references/standards-smell-baseline.md).
   Repository rules override that baseline; anything enforced by tooling is skipped.
3. Read the direct review agent types from the package's `reviewProfile`:
   Low-risk uses `spec_review_standard` and `standards_review_standard`; Feature
   and High-risk use `spec_review_capable` and
   `standards_review_capable`. These static agents are Sol defaults. Dispatch
   them in parallel with
   `fork_turns="none"`, read-only authority, no delegation, and the configured
   output bound. Dispatch parallel read-only sub-agents:
   - **Standards** owns correctness, architecture, maintainability, security,
     operations, rollback, and behavior-focused test quality.
   - **Spec** owns missing or incorrect requirements and out-of-contract scope.
4. Return the complete actionable finding set for each axis. Apply
   `docs/workflow/discovered-work-scope-containment.md`.
   The same blocking-authority rule applies to initial
   and remediation review: only a frozen
   contract gap, candidate regression, or applicable binding-authority
   violation blocks. A reviewer preference cannot create a new acceptance
   criterion. Label other discoveries as follow-up candidates.

   In short: reviewer preference cannot create a new acceptance criterion.
5. Record each complete result once:
   `workflow-state.py review-conclusion <slug> --axis
   <spec-review|standards-review> --status
   <accepted|accepted_gaps|blocked> --evidence <report-reference>`.
   Then record `review=passed`, `accepted_gaps`, or `blocked`. The gate
   stores one final candidate identity and one outcome per axis, then removes
   the temporary review input.
6. A blocking result returns to implementation. Batch compatible in-scope
   fixes, rerun targeted feedback, stage the new complete candidate, rerun the
   applicable final check, and dispatch a fresh dual-axis review. Candidate
   mutation invalidates both check and review. Repeated same-root failures route
   through `continue` and its continuation right-sizing boundary.

Wait only on the critical path and send at most one follow-up per reviewer for
one unchanged candidate. If either independent context is unavailable, record
review blocked. Main-agent self-review and Trellis-style check/review are not fallbacks.
Reviewers remain read-only.
