# Workflow Source Mapping

This static map records Happy's selective adoption of
`ai-coding-template` `workflow-2026.09.4` at
`9243174707d21e7325c2877b37c54fd7a2e24045`. It is provenance for the
cutover, not a runtime registry, receipt, or recurring audit.

## Capability ownership

| Capability | Owner | Happy landing |
| --- | --- | --- |
| PRD, Feature Spec, Task File, Status, Steps, Notes | iOS Guide-derived workflow | `create-prd`, `generate-spec`, `generate-tasks`, `docs/specs/`, `docs/tasks/` |
| Research and clarification | Matt | `research`, `grill-with-docs`, `grilling`, `domain-modeling` |
| Task publication and tracker intake | Matt | `publish-tasks`, `triage`, `docs/agents/issue-tracker.md` |
| Implementation, TDD, diagnosis, architecture | Matt | `implement`, `tdd`, `diagnosing-bugs`, `codebase-design`, `improve-codebase-architecture` |
| Two-axis semantic review | Matt | `code-review`, with Spec and Standards dispatched independently on Sol Medium |
| Task launch and resume | Repository integration | `generate-tasks`, ordinary Git isolation, Happy launcher, `start` |
| Project commands and submission safety | Happy | `.ai/project.json`, `workflow-check.py`, `workflow-ci.py`, `validate-happy-workflow.py` |
| Product branches, client operations, and release behavior | Happy | `AGENTS.md`, `devtools/`, project-local operational Skills, existing CI |
| Upstream workflow adoption | Happy | schema-2 `.ai/template-adoption.json` and exact-release `adopt-upstream-template` dry-run/apply |

## Retained Happy deviations

- `AGENTS.md`, `CONTEXT.md`, `.ai/project.json`, `.codex/config.toml`,
  `.github/workflows/`, `devtools/`, product rules, native protected paths,
  and Happy operational Skills remain downstream-owned.
- `workflow-ci.py` prefers the Happy structural validator so the generic
  template checker does not reject frozen Claude files, passive historical
  Workspaces, or repository-specific Skills.
- The Issue #111 compatibility commands retain
  `test-happy-workflow-state-upgrade.py` and the
  `workflow-audit.py --all --strict` command name. The latter now validates
  only the current adoption boundary and never reads Workspace records.
- `CLAUDE.md` and `.claude/` remain frozen and unmanaged.

## Current execution model

Immediate bounded work can remain in the current Session. A Task is created
only when an accepted slice moves to a fresh implementation Session. That Task
has one stable Task File and one GitHub Issue. The coordinator prepares one
ordinary Git branch/worktree, launches Happy in that directory, waits until the
Session is ready, then sends the full Issue URL as its first request.

Implementation uses Matt `implement` and `tdd` where applicable. The final
engineering diff receives the explicitly configured command suite once and one
parallel `code-review` pair. Task work then updates only Task status and
reusable guidance before the same scoped local commit.

Historical `docs/workspace/` content is passive Git evidence. Current routing,
checks, Skills, and generated projects do not create, append, or consume
Workspace lifecycle state, receipts, archives, candidate packages, or review
ledgers.

## Adoption boundary

Only paths listed in `.ai/template-adoption.json.include` are projected from
the immutable upstream checkout. Happy-owned paths are preserved explicitly.
A dry-run precedes every apply, and a post-apply dry-run must be clean or have
each remaining downstream customization explained. Full-manifest or
cross-downstream synchronization is out of scope.
