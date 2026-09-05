---
name: finish-work
description: Finish Task-bound work after its one final test suite and code-review, updating only Task completion and reusable project guidance before the same local commit.
---

# Finish Work

Use this only for a Task. Current-Session work without a Task finishes through Matt `implement` after its applicable checks and `code-review`.

1. Require the applicable full test suite and complete-diff `code-review` to have passed for the final engineering diff.
2. Update the stable Task File: mark completed Steps and set `Status: Complete`. Add or trim Notes only when they are needed to resume or explain the result.
3. If the work revealed an evidenced reusable pattern, bug-prevention rule, or durable decision, invoke `update-project-guidance` to update the narrowest existing owner. If there is no reusable learning, write nothing and create no receipt.
4. If finishing changes engineering behavior or scope, return to the contract, rerun the affected final engineering checks, and review the resulting complete diff. Pure Task metadata or guidance-only updates do not trigger a second test suite or review.
5. Include Task completion and applicable guidance in Matt `implement`'s same final local commit. Do not prompt for another commit or create a separate bookkeeping commit.
6. Report any remaining delivery action. Push, PR, merge, release, Issue mutation, and cleanup remain separately authorized.

Do not create or update Workspace state, archives, journals, receipts, evidence ledgers, or Session records.
