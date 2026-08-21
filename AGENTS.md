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

Every formal personal feature uses the repository-local lifecycle:

```text
Start -> Plan -> Scope -> Build -> Verify -> Review -> Finish -> Archive
```

- Read `.ai/project.json` for exact commands, protected paths, and tracker
  configuration.
- Create durable state under `docs/workspace/<slug>/` and use
  `scripts/workflow-state.py` for phase transitions and gate receipts.
- Run `python3 scripts/workflow-audit.py --strict --require-active` before
  implementation, handoff, and finish.
- Keep personal product code under explicit feature modules where possible;
  host integration files should contain only small, reviewable seams.
- Before an authorized commit, archive with `commit=pending`, stage product and
  workflow evidence together, and pass `python3 scripts/workflow-ci.py --staged`.
- Do not run the upstream template's full synchronization manifest in this
  repository. Use `.ai/template-adoption.json` for dry-run-first workflow-core
  updates so Happy-owned rules and skills remain intact.

## Personal Branch Model

- `upstream/main` is the official source baseline.
- Personal `main` may differ from `upstream/main` only in `devtools/`, `.agents/skills/happy-desktop-update/`, `.agents/skills/happy-ios-release/`, `AGENTS.md`, and `.gitignore`.
- `dev` is the personal product integration, desktop build, and release branch.
- Merge official updates into personal `main`, validate the devtools-only delta, then merge `main` into `dev`.
- Do not use `git reset`, history rewriting, or force pushes to synchronize these branches.

## Happy Devtools

Cross-platform client operations live in `devtools/`; use `devtools/happyctl` on macOS/Linux and `devtools/happyctl.ps1` on Windows. Generated reports, logs, backups, downloaded runtimes, credentials, and machine-local configuration must remain outside tracked source.
