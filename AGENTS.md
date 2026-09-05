# Agent Workflow

## Main Synchronization

When the user says `sync to main` or `synt to main`, route the request through
the Personal Branch Model below. Personal product features integrate into
`dev`; synchronize official `main` only through `devtools/happyctl sync-dev`.
The tracked pre-push guard must be active via
`devtools/happyctl install-git-guards` before any synchronization.

## Personal Feature Development

Keep the product tree on `main` equivalent to `upstream/main`; only the
allowlisted personal devtools infrastructure described below may differ.
Personal-only features branch from `dev` and merge back through review;
upstream-bound work branches from `upstream/main` or another verified clean
official base.

Matt Skills read tracker, triage-label, and domain configuration from
`docs/agents/`. The canonical workflow is documented in `docs/workflow.md`.

- Immediate bounded work may stay in the current Session without a Task or
  Issue. A Task exists only for an accepted slice that moves to a fresh
  implementation Session, and it has exactly one Task File and one GitHub
  Issue.
- Historical `docs/workspace/` records and archive indexes are passive. Current
  routing, checks, Skills, and generated projects must not read, execute, copy,
  append, or create Workspace lifecycle state, receipts, or archives.
- Use the Matt flow selected by the accepted request: implement with TDD where
  applicable, run the configured full suite once on the final engineering diff,
  and run parallel Spec and Standards review through `code-review` before the
  scoped local commit. Task-bound work then uses `finish-work` to update only
  Task status and reusable guidance in that same commit.
- Read `.ai/project.json` for exact commands, protected paths, tracker
  configuration, and risk triggers. `scripts/workflow-check.py` executes only
  explicitly named command groups; `scripts/workflow-ci.py --staged` protects
  the complete atomic candidate before commit.
- Keep personal product code under explicit feature modules where possible;
  host integration files should contain only small, reviewable seams.
- Root sustained implementation must stay in the current human-facing Session
  root. Fresh-Session Task work uses one dedicated branch/worktree prepared by
  ordinary Git before Happy is launched in that exact directory.
- Do not run the upstream template's full synchronization manifest in this
  repository. Use the version-pinned schema-2 `.ai/template-adoption.json`
  allowlist from a clean accepted release checkout, dry-run before apply, and
  preserve Happy-owned rules, project configuration, Skills, CI, release
  behavior, and product customization.
- Codex workflow Skills live in `.agents/skills/`. Treat `CLAUDE.md` and
  `.claude/` as frozen, unmanaged compatibility files: do not synchronize,
  validate, distribute, or delete them unless the user explicitly re-enables
  Claude maintenance.

## Personal Branch Model

- `upstream/main` is the official source baseline.
- Personal `main` may differ from `upstream/main` only in `devtools/`, `.agents/skills/happy-desktop-update/`, `.agents/skills/happy-desktop-official-release/`, `.agents/skills/happy-ios-release/`, `AGENTS.md`, and `.gitignore`.
- `dev` is the personal product integration, desktop build, and release branch.
- Merge official updates into personal `main`, validate the devtools-only delta, then merge `main` into `dev`.
- Do not use `git reset`, history rewriting, or force pushes to synchronize these branches.

## Happy Devtools

Cross-platform client operations live in `devtools/`; use `devtools/happyctl` on macOS/Linux and `devtools/happyctl.ps1` on Windows. Generated reports, logs, backups, downloaded runtimes, credentials, and machine-local configuration must remain outside tracked source.

## Official macOS Baseline Release

When the user asks to release or publish the official macOS client from `main`
and means a local source-built app, use the project-local
`happy-desktop-official-release` Skill. The executable entrypoint is
`devtools/happyctl refresh-official-baseline`; it must use the isolated baseline
worktree and must not replace the personal development client. Public
distribution requires a separate, explicit workflow.
