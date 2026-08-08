---
name: workflow-audit
description: Audit whether repository evidence proves the complete formal AI coding lifecycle ran. Use for workflow completeness, adoption, compliance, missing gates, or completion claims.
---

# Audit Workflow

Work read-only.

## Workflow

1. Identify the formal task, intensity, complete lifecycle gates, and contracts.
2. Inspect workflow state, decisions, journals, task links, validation, finish
   review, commits, tests, and CI evidence.
3. Distinguish evidence from declarations; a checked box without a command or
   artifact is weak evidence.
4. Compare actual evidence with `docs/workflow/intensity-matrix.md`.
5. Classify each gate as `proven`, `partial`, or `missing`; only decision/risk
   assessments may be evidenced non-applicable.
6. Report `pass`, `pass-with-gaps`, or `fail`, followed by the smallest repairs.

Run `python3 scripts/workflow-audit.py --strict --require-active <slug>` first.
Treat machine invariant failures as authoritative, then add semantic findings.

Do not repair state, rerun finish, or rewrite history during an audit. Explicitly
state when missing evidence prevents a conclusion.
