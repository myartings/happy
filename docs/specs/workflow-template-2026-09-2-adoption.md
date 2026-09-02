# Selective Adoption of Workflow 2026.09.2

## Outcome

Happy adopts the project-compatible selective workflow core from the immutable
`ai-coding-template` release `workflow-2026.09.2` at commit
`40dc17d0d200370fd8c5498fb1da1bdd9ebde4e9`, reaches zero drift for the
accepted allowlist, and preserves Happy-owned repository and product authority.

## Delivery boundary

This contract is one tracker-backed delivery Slice: GitHub Issue #104. The
canonical release plan identifies Happy exactly once as the second Canary and
has no rollout targets. It supersedes the delivery intent of the blocked local
`workflow-2026.09.1` Workspace, whose evidence and worktree remain untouched.

The Slice ends at a fully checked, independently reviewed, staged local
candidate. Commit, push, pull request, merge, Issue mutation or closure,
worktree cleanup, and client release require separate authorization.

## Source and synchronization contract

1. The applying source checkout is clean and its `HEAD` and dereferenced tag
   both equal the recorded immutable commit.
2. The canonical schema-2 release plan names Happy exactly once as a Canary.
3. Happy's schema-2 `.ai/template-adoption.json` is the only synchronization
   manifest used. The upstream full synchronization manifest is forbidden.
4. A source-script dry-run precedes apply. Every reported surface is classified
   as adopted, preserved, translated, retired, or rejected.
5. Canonical allowlisted artifacts use the upstream transactional synchronizer;
   Happy-owned translations remain explicit local changes.
6. A final dry-run from the same pinned source reports zero drift.

## Preservation and translation contract

- Preserve Happy's `AGENTS.md`, `CONTEXT.md`, personal `main`/`dev` branch
  model, tracker target, protected paths, product commands, custom skills,
  Paper MCP configuration, `.claude/`, `.github/workflows/`, `devtools/`,
  product code, dependencies, native paths, product CI, and release behavior.
- Translate compatible upstream semantics into `.ai/project.json`, Happy-owned
  validators/adapters, and other manifest-preserved workflow integration files
  without weakening existing fail-closed checks.
- Adopt only manifest-declared workflow skills, Codex role/hooks guidance,
  workflow documentation/templates, and workflow runtime scripts.
- Do not bulk-rewrite archived Workspaces. Current active-state and passive
  archive compatibility must remain valid under the adopted runtime.
- Retire a path only when the manifest classifies it safely and any required
  fingerprint matches.

## Failure and rollback behavior

Stop before apply on source dirt, identity mismatch, target/base divergence,
unexpected dry-run surfaces, unsafe retirement, full-manifest use, or
preserved-authority drift. Stop completion on non-zero final drift, failed
configured checks, unreviewed material changes, or product-surface changes.

Before an authorized commit, rollback is removal of the complete local
candidate diff. After a separately authorized single delivery commit, rollback
is one revert. No product data or runtime migration is part of this Slice.

## Acceptance criteria

1. The accepted tag dereferences to the recorded commit, the source checkout is
   clean at that commit, and the canonical plan names Happy exactly once as the
   second Canary with no rollout targets.
2. The manifest records `.2` provenance and the initial dry-run's 23 updates,
   retirement states, and project-owned merge are fully classified before apply.
3. The upstream full manifest is never used; only accepted canonical paths are
   synchronized and project-owned translations are reviewable.
4. Every preserved Happy authority and excluded product surface remains intact.
5. Current Workspace compatibility and passive historical archives validate
   without bulk historical rewrites.
6. The final dry-run against the same pinned source reports zero drift.
7. Selective-adoption validation, configured applicable checks, strict audit,
   changed-path inspection, and staged workflow CI pass on the complete candidate.
8. Independent capable Spec and Standards reviews accept the same pinned
   candidate, including the responsible-owner risk controls.
9. No application, server, dependency, native protected path, generated output,
   product CI, devtools, protocol, release, or client-install change is present.

## Evidence map

| Criterion | Evidence |
| --- | --- |
| AC1 | source Git identity/status and canonical release-plan output |
| AC2-AC3 | pre-apply dry-run, classification ledger, manifest and whole diff |
| AC4-AC5 | preserved-path inspection, validators, active/all strict audit |
| AC6 | final pinned-source dry-run |
| AC7 | `workflow-check.py --applicable`, targeted suites, staged CI |
| AC8 | candidate-bound capable Spec/Standards conclusions |
| AC9 | changed-path and protected/product negative inspection |
