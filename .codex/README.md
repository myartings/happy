# Codex Support

Start Codex from the repository root. Use `AGENTS.md` as the project router,
`.agents/skills/` for workflow instructions, and `.ai/project.json` for real
commands. This template intentionally defines no stack-specific MCP servers.

Read `.codex/REASONING.md` before escalating reasoning effort or dispatching
specialist agents. Writer agents require isolated worktrees and bounded scope.

The starting recommendation is deliberately small:

- Use `gpt-5.6-luna` at High effort for bounded exploration, research,
  mechanical work, and other contract-pinned work with deterministic checks.
  The isolated `worker` default uses Luna at XHigh.
- Use `gpt-5.6-sol` at Medium effort for Root judgment, integration,
  architecture, unknown-root-cause diagnosis, High-risk boundaries, and both
  independent review axes. Raise Sol effort only when uncertainty or
  consequence justifies it.

The model defaults live directly in `.codex/config.toml` and
`.codex/agents/*.toml`. They are starting defaults, not a selectable repository
policy and not a reason to create a child context.

When work running on a Luna Root materially crosses a Sol boundary, state the
reason and recommend the exact Sol model and effort. The operator performs
`/model` and verifies the effective model with `/status`; repository code and
Agents never execute or claim the switch. If the client cannot verify an
in-session change, continue from a fresh suitable Root in the same accepted
task, branch, and worktree. A Sol subagent never counts as a Root-model change.

Do not downgrade automatically, retry an escalation loop, or turn model choice
into task or lifecycle state. Existing acceptance, risk, isolation, and
independent-review gates remain authoritative.
