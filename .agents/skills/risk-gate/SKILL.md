---
name: risk-gate
description: Assess high-consequence coding work and define controls before implementation or release. Use for authentication, authorization, billing, security, privacy, data migration, destructive operations, production deployment, external API contract changes, or repeated failures.
---

# Assess Risk

## Workflow

1. Identify affected users, data, money, permissions, external systems, and blast radius.
2. Classify reversibility and the cost of false success or partial failure.
3. Enumerate failure modes, including interruption and retry behavior.
4. Require applicable controls: backup/migration test, feature flag, dry run,
   least privilege, staged rollout, idempotency, audit log, or rollback.
5. Define deterministic preconditions and stop conditions.
6. Assign independent review and responsible-owner decisions where needed.
7. Record the result in the spec, tasks, decisions, and validation plan.

Return `cleared`, `cleared-with-controls`, or `blocked`. Never treat a warning in
chat as an adequate control for destructive or irreversible behavior.

For every accepted High-risk Trellis task, persist the assessment with:
`python3 scripts/workflow-state.py gate <slug> risk <status> --evidence "<evidence>"`.
Use `passed` for cleared outcomes and `blocked` for unresolved risk. A required
risk gate cannot be marked `not_required`; otherwise evidenced non-applicability
must still be recorded explicitly.
