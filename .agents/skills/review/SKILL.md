---
name: review
description: Review a bounded code or documentation diff for correctness, regressions, security, maintainability, contract drift, and missing verification. Use when the user asks for review or before finishing Feature or High-risk work.
---

# Review Changes

## Workflow

1. Confirm review scope and inspect the complete relevant diff.
2. Read applicable project rules, spec, tasks, architecture, and validation record.
3. Trace changed behavior through callers, state, errors, and tests.
4. Check protected boundaries, compatibility, security/privacy, data integrity,
   concurrency, operations, and rollback where applicable.
5. Verify tests exercise behavior rather than merely implementation structure.
6. Report only actionable findings, ordered by severity, with file/line evidence.
7. State remaining test gaps or uncertainty after findings.

For every formal task, record `review=passed` only when no blocking finding
remains; otherwise record `review=blocked` with the highest unresolved finding.

Work read-only unless the user separately asks to implement fixes. Do not report
style preferences as defects unless they violate explicit repository guidance.
