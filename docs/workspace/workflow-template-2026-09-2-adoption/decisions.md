# Decisions: `workflow-template-2026-09-2-adoption`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | Which upstream source is authoritative? | decided | Only clean `workflow-2026.09.2@40dc17d0d200370fd8c5498fb1da1bdd9ebde4e9`; tag and HEAD match. |
| D2 | Is Happy authorized to adopt this release? | decided | The canonical schema-2 plan lists `html-artifact-app`, then `happy`, as Canaries and has no rollout targets. |
| D3 | How is the blocked `.1` Workspace reconciled? | decided | Issue #104's authorized `.2` Canary Slice supersedes its delivery intent. Preserve the old worktree and evidence unchanged; do not copy its stale contract or treat it as active here. |
| D4 | Which synchronization boundary applies? | decided | Use only Happy's version-pinned schema-2 selective manifest. Reject the upstream full manifest and source-maintainer/release-fleet machinery. |
| D5 | Which authority remains Happy-owned? | decided | Preserve root rules, branch/devtools/release policy, product commands and CI, tracker/protected paths, custom skills, Paper MCP, frozen `.claude/`, and all product/dependency/native surfaces; translate only compatible workflow semantics. |
| D6 | What execution topology and capability apply? | decided | Current Root, serial topology, exact registered Issue worktree; runtime metadata confirms `gpt-5.6-sol / medium`. Independent reviewers are read-only. |
| D7 | What is the delivery boundary? | decided | Finish at a staged, checked, reviewed local candidate. No commit, push, PR, merge, Issue mutation/closure, cleanup, or release without separate authorization. |
