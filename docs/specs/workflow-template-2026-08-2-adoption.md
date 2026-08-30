# Versioned Selective Workflow Adoption

## Outcome

Happy adopts the project-compatible execution core from
`ai-coding-template` release `workflow-2026.08.2` without replacing Happy's
repository authority, product behavior, personal branch model, release tools,
custom Agent skills, or Paper MCP configuration.

The adoption is reproducible from the immutable source commit
`8d07a74931f8dcf6a668c2a6a4dcaf9c490a2842` and remains dry-run-first.

## Scope

- Upgrade `.ai/template-adoption.json` to the upstream schema-2 synchronization
  contract with an explicit file and directory allowlist.
- Adopt the distributed Codex workflow skills, documentation, Workspace
  template, issue template, Codex role guidance, hooks, and runtime scripts.
- Reconcile Happy-owned `AGENTS.md`, `.ai/project.json`, `.codex/config.toml`,
  `CONTEXT.md`, `scripts/workflow-check.py`, and
  `scripts/validate-happy-workflow.py` manually.
- Preserve Happy custom skills and freeze the existing `.claude/` tree outside
  future template synchronization.
- Retire obsolete downstream copies of upstream source-maintainer workflow
  tests only when their current fingerprints match the accepted retirement
  entries.
- Prove that the schema-1 active migration Workspace remains operable under the
  adopted runtime and that archived history requires no bulk rewrite.
- Add a Happy-owned, evidence-preserving active-state upgrader because the
  released runtime intentionally removed its former active migration command.

## Non-goals

- Running or adopting the upstream full synchronization manifest.
- Replacing Happy root instructions, product CI, application code, dependencies,
  release automation, or the personal `main`/`dev` branch model.
- Maintaining or distributing upstream's frozen Claude workflow mirror.
- Importing upstream project-generation, source-maintenance CI, release-planning,
  or fleet-rollout machinery.
- Changing external Issues, creating a pull request, committing, pushing, or
  merging without separate authorization.

## Source and adoption contract

1. The source is a clean detached checkout whose `HEAD` equals the pinned
   release commit.
2. The target manifest uses schema 2, records release provenance, names every
   adopted surface explicitly, and never relies on a target-relative source
   checkout path.
3. A source-script dry-run using the target manifest precedes every apply.
4. Every dry-run surface is classified as adopted, preserved, translated,
   retired, or rejected before apply.
5. Apply uses the release synchronizer's transactional path for canonical
   artifacts; project-owned translations use reviewable local edits.
6. A second dry-run against the same pinned checkout reports zero drift.

## Project-owned preservation contract

- `AGENTS.md` retains Happy synchronization, branch, devtools, and official
  desktop release rules while incorporating only compatible workflow semantics.
- `.ai/project.json` retains the Happy identity, pnpm commands, tracker target,
  protected/generated paths, and risk triggers while adding portable Python
  commands, check profiles, check selection, and review profiles.
- `scripts/workflow-check.py` strengthens the adopted runtime by failing closed
  on every non-evidence worktree/index difference before and after each formal
  staged command; current-task machine evidence remains the only exception.
- `.codex/config.toml` retains `[mcp_servers.paper]` while adding accepted model
  and subagent defaults.
- `CONTEXT.md`, `docs/PRD.md`, product architecture documents, `devtools/`,
  `.github/workflows/`, `packages/`, and Happy-specific skills are not replaced.
- `.claude/` remains byte-for-byte unchanged by this migration and is excluded
  from future template adoption unless the user separately re-enables it.

## Compatibility and state

- The adopted runtime must accept the active schema-1 migration Workspace.
- The Happy upgrader may transform only a non-archived schema-1 Feature or
  High-risk Workspace, must preserve all gates/history, and may add only current
  standard layout metadata plus an explicitly approved local-only source.
- New Workspace templates use the accepted upstream template schema.
- `workflow-audit.py --all --strict` treats archived Workspace history as
  passive and validates only current repository authority plus the active
  Workspace.
- No historical Workspace is rewritten solely to satisfy the new runtime.
- Missing or incompatible project-only template validation is handled by the
  Happy-specific validator rather than weakening Happy custom skill contracts.

## Failure and rollback behavior

- Source dirt, source identity mismatch, manifest validation failure, retirement
  fingerprint mismatch, full-manifest scope, or unexpected target changes stop
  before apply.
- A failed transactional synchronization must leave the target unchanged.
- Any manual translation that breaks the active Workspace, project validation,
  or configured checks blocks completion.
- Before commit, rollback is the complete local diff. After an authorized
  single delivery commit, rollback is one revert; no product or data migration
  rollback is required.

## Acceptance criteria

1. The accepted source tag resolves to the recorded immutable commit and the
   applying checkout is clean at that commit.
2. The schema-2 selective manifest validates, uses explicit includes, preserves
   Happy-owned surfaces, records safe retirements, and excludes the upstream
   full-sync and template-maintenance surfaces.
3. The pinned-source dry-run is captured before apply and reports zero drift
   after the final reconciliation.
4. Happy's root rules, branch model, devtools/release behavior, product commands,
   tracker mapping, protected paths, Paper MCP, custom skills, and `.claude/`
   contents remain preserved.
5. The accepted upstream workflow runtime, distributed Agent skills, selected
   documentation, Workspace template, Codex role guidance, and hooks are present.
6. `.ai/project.json` provides portable Python commands, valid check/review
   profiles, deterministic path-based check selection, and unchanged product
   command semantics.
7. Happy's selective validator rejects a floating or mismatched source,
   forbidden/broad adoption paths, missing runtime dependencies, and drift in
   preserved project authority.
8. Obsolete copied tests are safely retired by accepted fingerprints and
   replaced by bounded Happy validator plus public-CLI runtime suites covering
   state gates, staged isolation, candidate binding, archive success, rollback,
   and CI; no stale check remains configured as authoritative.
9. The active migration Workspace passes strict audit under the adopted runtime,
   while existing archived Workspace content is not bulk-modified.
10. Applicable workflow checks, selective validation, strict audit, staged
    workflow CI, diff checks, and independent whole-diff review pass with exact
    evidence.
11. No application, server, dependency, product CI, devtools, protocol, release,
    or generated file changes are introduced.

## Evidence map

| Criterion | Evidence |
| --- | --- |
| AC1-AC3 | Git identity/status, recorded dry-runs, manifest validation |
| AC4-AC5 | Preservation hash/path inspection and whole-diff review |
| AC6-AC8 | Happy validator tests, project-config inspection, targeted runtime checks |
| AC9 | Active schema compatibility test and `workflow-audit.py --all --strict` |
| AC10 | `validation.md`, staged CI, independent Spec/Standards review |
| AC11 | Bounded changed-path inspection and product-surface negative checks |
