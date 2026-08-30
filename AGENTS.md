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

Do not infer a Trellis task from a repository diff. Clear, bounded,
normal-risk single-session work may stay in the current context.
No-task work needs no lifecycle receipt. Ask before creating durable task state
when work is complex, high-risk, cross-session, coordination-heavy, or the user
requests it.

After explicit acceptance, every formal personal feature uses the
repository-local lifecycle:

```text
Start -> Plan -> Scope -> Build -> Verify -> Review -> Finish -> Archive
```

- Read `.ai/project.json` for exact commands, protected paths, and tracker
  configuration.
- Create durable state under `docs/workspace/<slug>/` only for an accepted
  task and use
  `scripts/workflow-state.py` for phase transitions and gate receipts.
- Run `python3 scripts/workflow-audit.py --strict --require-active` before
  implementation and completion when a task is active. Run
  `python3 scripts/workflow-audit.py --all --strict` for current repository
  health. Historical Workspace and archive files are passive.
- Run `python3 scripts/workflow-check.py --applicable` for accepted-task final
  verification; ambiguous changed scope selects the complete configured family.
- Keep personal product code under explicit feature modules where possible;
  host integration files should contain only small, reviewable seams.
- Before an authorized delivery commit, finish check and independent review,
  stage the complete accepted candidate, generate the canonical terminal
  archive projection for an active task, and pass
  `python3 scripts/workflow-ci.py --staged`. No-task work still stages and
  verifies its atomic candidate but creates no lifecycle evidence.
- Root sustained implementation must stay in the current human-facing session root.
  A command-level `workdir` override does not rebind the session; moving
  sustained Root work to another linked worktree requires a visible native
  handoff or a user-authorized fresh session there.
- Do not run the upstream template's full synchronization manifest in this
  repository. Use the version-pinned schema-2 `.ai/template-adoption.json`
  allowlist from a clean accepted release checkout, dry-run before apply, and
  preserve Happy-owned rules, project configuration, skills, CI, and release
  behavior.
- Codex workflow skills live in `.agents/skills/`. Treat `CLAUDE.md` and
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
