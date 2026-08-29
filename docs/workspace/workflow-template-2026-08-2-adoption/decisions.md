# Decisions: `workflow-template-2026-08-2-adoption`

| ID | Question | Options and constraints | Owner / reversibility / cost of error | Status | Decision and evidence |
| --- | --- | --- | --- | --- | --- |
| D1 | Which upstream identity is accepted? | Floating `main`, a commit-only snapshot, or a release tag. Reproducibility requires immutable release evidence. | User accepted recommended migration; changing the pin is cheap before apply, while a floating source makes later audit impossible. | resolved | Use `workflow-2026.08.2`, resolving to `8d07a74931f8dcf6a668c2a6a4dcaf9c490a2842`. Remote `main` is `53f280fa03c24874f639c64c2b881340016e3cd4` with the same tree at inspection time. |
| D2 | Full or selective adoption? | Full sync changes Happy root authority and `.codex/config.toml`; selective adoption must remain coherent. | Repository rules own the decision; wrong full adoption could weaken branch/release safeguards. Revert is possible but review cost is high. | resolved | Selective only. Upstream full dry-run reported 73 required updates, including changed `AGENTS.md` and `.codex/config.toml`; `AGENTS.md` explicitly forbids the full manifest. |
| D3 | How is source location represented? | Existing target-relative `../ai-coding-template`, an absolute machine path, or an identity-pinned clean checkout supplied at execution. | Repository integration owner; manifest changes are reversible. Relative/absolute persisted paths fail across linked worktrees or machines. | resolved | Remove path-based source authority. Record repository/release/commit provenance and invoke the pinned source synchronizer with `--manifest .ai/template-adoption.json`. |
| D4 | How broad may the allowlist be? | Whole `.agents/skills`, `.claude/skills`, and `docs/workflow`; or explicit distributed surfaces. | Repository rules; a broad list can import source-maintainer or frozen content silently. | resolved | Use the upstream schema-2 distributed manifest as a starting set, then explicitly omit full-root/template-maintainer surfaces and list Codex skills/docs/scripts individually. |
| D5 | What happens to Happy-owned instructions and tool configuration? | Overwrite, preserve entirely, or translate compatible upstream semantics into local authority. | Happy owns these files. Edits are reversible; silent overwrite could break sync, releases, or Paper MCP. | resolved | Manually translate compatible semantics into `AGENTS.md`, `.ai/project.json`, and `.codex/config.toml`; preserve Happy identity, branch/devtools/release rules, product commands, tracker, protected paths, risk triggers, and Paper MCP. |
| D6 | What happens to `.claude/`? | Continue mirroring, delete, or freeze. Upstream now treats Claude files as unmanaged. | User owns cross-agent compatibility. Deletion is disruptive; freezing is reversible. | resolved | Freeze and preserve the current `.claude/` tree byte-for-byte; remove it from future adoption scope. Cleanup or re-enablement is a separate user decision. |
| D7 | How is downstream validation handled? | Adopt upstream validator unchanged, keep the old validator, or update the Happy validator around the selective boundary. | Happy integration owner. The upstream validator currently reports 31 incompatibilities, including false failures on Happy custom skill metadata. | resolved | Keep and expand `validate-happy-workflow.py`; do not weaken or relabel custom Happy skills to satisfy template-only assumptions. Replace stale configured tests with a bounded Happy integration seam or safe retirement evidence. |
| D8 | Must historical Workspaces be migrated? | Bulk rewrite, active-only migration, or compatibility without rewriting. | Workflow state owner. Bulk rewrite risks falsifying evidence and creates a large unrelated diff. | resolved | No bulk rewrite. Archived history remains passive. Diagnosis proved the released runtime rejects the old active `legacyImport` field and cannot record delivery source after acceptance; use the tested Happy active-state upgrader to preserve gates/history and add only schema-3 standard layout plus the already approved local-only source. |
| D9 | What is the execution topology? | Parallel writers, separate implementation worktree, or current Root serial execution. Shared workflow contracts and runtime are tightly coupled. | Current Root; topology is reversible before edits. Parallel writes raise integration risk without independent slices. | resolved | Serial current-session Root in the existing isolated Happy worktree. No writer subagent, batch, external tracker, or PR is required. Independent read-only review remains required at the review gate. |

## Risk controls

- Pin and verify a clean source checkout before dry-run or apply.
- Capture full-sync rejection and selective pre-apply dry-run evidence.
- Require explicit allowlists and fingerprint checks for every retirement.
- Stop on source dirt, source mismatch, unexpected target paths, preservation
  drift, failed transaction, or non-zero post-apply dry-run.
- Keep product paths, `.claude/`, Happy custom skills, product CI, and devtools
  outside mutation scope; inspect them after apply.
- Maintain one uncommitted diff and one eventual revert boundary; do not commit,
  push, merge, or publish externally without separate authorization.
- For a pre-release active Workspace only, require a tested schema upgrade that
  preserves every gate and history event, records the exact user-approved
  local-only source, validates under the adopted runtime, and rolls back all
  state files on validation failure. Historical archived states remain passive.

Risk result: `cleared-with-controls`. The migration changes local workflow
authority and commit enforcement but no user data, product runtime, credentials,
external service, production deployment, or irreversible state. The controls
above are mandatory stop conditions.

## Scoping result

Result: `ready`.

- Intensity: High-risk because the workflow validates and archives itself.
- Execution: serial current-session Root in the existing isolated worktree;
  shared runtime/configuration contracts have no safe independent writer slice.
- Tracker: local-only exception accepted by the user; no delayed pickup,
  delegation, external coordination, PR delivery, or tracker write is needed.
- Allowed surfaces: accepted workflow skills/docs/runtime/configuration,
  selective-adoption validation, and this Workspace's evidence.
- Blocked surfaces: `packages/`, `devtools/`, product workflows/dependencies,
  protocols, release behavior, credentials, generated paths, unrelated
  Workspaces, and `.claude/` content.
- Incremental seam: manifest/validator first, pinned dry-run second,
  transactional canonical apply third, project-owned translations fourth,
  self-hosting and final checks last.
- Final evidence: selective zero-drift dry-run, Happy validation, focused runtime
  checks, strict active/all audit, changed-path inspection, staged workflow CI,
  and independent Spec/Standards review.
