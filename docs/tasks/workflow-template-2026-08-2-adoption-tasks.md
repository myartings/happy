# Tasks: Versioned Selective Workflow Adoption

## T1 — Pin source and freeze the contract

- Record the release tag, immutable commit, source cleanliness, current Happy
  baseline, full-sync rejection evidence, and local-only tracker boundary.
- Accept the specification, decisions, risk controls, scoping result, and role
  context before implementation.
- Validation: source Git inspection, current workflow validation and audit.

## T2 — Upgrade the selective adoption boundary

- Convert `.ai/template-adoption.json` to schema 2 with explicit includes,
  provenance, preservation, required checks, and fingerprinted retirements.
- Extend `validate-happy-workflow.py` to validate the new manifest and preserved
  Happy contracts without treating custom skills as upstream template skills.
- Validation: focused manifest/validator tests and rejected-invalid fixtures.
- Depends on: T1.

## T3 — Adopt the pinned canonical runtime

- Run the release synchronizer dry-run with the Happy manifest and retain its
  classification.
- Apply only canonical allowlisted Agent skills, workflow documents, Workspace
  template, Codex support files, issue template, and runtime scripts.
- Run a second dry-run after local reconciliation and require zero drift.
- Validation: source/target identity, sync output, changed-path allowlist.
- Depends on: T2.

## T4 — Reconcile Happy-owned authority

- Merge compatible workflow semantics into `AGENTS.md` without weakening the
  branch, devtools, release, or selective-adoption boundaries.
- Add portable command/check/review profiles to `.ai/project.json` while
  preserving Happy product configuration.
- Merge upstream model defaults into `.codex/config.toml` while preserving Paper
  MCP; keep `.claude/` and Happy custom skills unchanged.
- Safely retire or replace obsolete copied test surfaces and update configured
  checks accordingly.
- Validation: config/validator tests, byte/path preservation checks, whole diff.
- Depends on: T3.

## T5 — Prove self-hosting compatibility

- Use the tested Happy active-state upgrader to preserve schema-1 evidence while
  adding only schema-3 layout and approved local-only source authority.
- Continue the schema-1 active migration Workspace with the adopted runtime.
- Run selective validation, applicable checks, strict active/all audit, workflow
  runtime integration checks, and staged workflow CI.
- Confirm historical archived Workspaces are not rewritten and no product path
  changed.
- Depends on: T4.

## T6 — Independent review and finish

- Review acceptance coverage and the complete candidate diff on separate Spec
  and Standards axes.
- Correct findings, rerun affected checks, record rollback and remaining gaps,
  finish and archive the local workflow.
- Do not commit, push, merge, publish an Issue, or open a PR without separate
  authorization.
- Depends on: T5.
