# Happy Personal Development Context

## Repository role

This repository contains both Happy product source and personal operations.
Personal `main` keeps the product tree equivalent to `upstream/main` while
carrying only allowlisted `devtools/` infrastructure; `dev` integrates personal
client features. Update, build, install, backup, rollback, and baseline
automation lives in `devtools/` and is invoked through `happyctl`.

## Personal feature rules

- Branch personal features from `dev`; use a verified official base for work
  intended for upstream.
- Prefer self-contained feature modules and narrow host seams so upstream merges
  remain reviewable.
- Do not change session or agent protocols for UI-only state unless a durable
  cross-device contract requires it and the decision is recorded.
- Treat authentication, repository permissions, token storage, destructive
  actions, and cross-device synchronization as risk-gated work.
- GitHub Issues are the human-visible queue; repository specs, tasks, and
  workflow evidence remain authoritative for implementation and verification.

## Workflow adoption boundary

The repository adopts only the execution core from `ai-coding-template`.
Happy-owned root instructions, official skills, product CI, and release behavior
remain authoritative and must not be replaced by template synchronization.
