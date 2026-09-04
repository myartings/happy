# Reasoning Effort Policy

- `low`: trivial inspection or formatting only when no configured role requires
  a stronger floor.
- `medium`: ordinary implementation with clear acceptance criteria.
- `high`: PRD, architecture, orchestration, non-trivial review, and debugging.
- `xhigh`: security, privacy, data migration, production incidents, destructive
  changes, or repeated failed fixes.

Escalate for uncertainty and consequence, not file count. A writer subagent does
not require higher effort merely because it is a subagent.

Use `gpt-5.6-luna` at Max for bounded evidence, deterministic work, and
contract-pinned isolated writing. Use `gpt-5.6-sol` Medium
for Root judgment, architecture, diagnosis, High-risk work, and independent
Spec and Standards review; use Sol High only when the accepted consequence or
uncertainty calls for it. Static defaults in `.codex/config.toml` and
`.codex/agents/*.toml` express these starting recommendations directly.

The workflow selects topology and ownership before considering capability.
Model guidance never creates a child, batch, branch, worktree, or execution
owner. Explorer, Researcher, and Mechanical remain bounded Luna contexts;
`diagnose` and both review axes remain separate read-only Sol contexts. Serial
tightly coupled work stays Root-inline.

A manual-Issue launch assessment is a narrow pre-launch choice, not a general
resolver. Complete low-consequence, no-risk, bounded input selects Luna Max.
Present risk, medium/high consequence, a Sol capability boundary, or material
ambiguity selects Sol Medium by default; higher Sol effort requires a visible
justification. Incomplete, malformed, or non-one-slice input selects no model.

If a Luna Root encounters materially harder work, state the capability reason,
recommend the exact `gpt-5.6-sol` effort, and ask the operator to use `/model`
and confirm it with `/status`. Continue in place only after that visible
confirmation. When the client cannot verify the change or the context is no
longer suitable, require a fresh suitable Root for the same accepted task,
branch, and worktree. A Sol subagent is evidence or review help, never proof
that the Root changed.

Never perform a silent switch, automatic downgrade, repeated escalation loop,
or durable model-choice state. Existing acceptance, risk, verification,
independent-review, and session/worktree authority remains unchanged.
