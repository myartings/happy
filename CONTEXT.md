# Happy Personal Development Context

## Repository role

This repository is the Happy product source checkout. `main` mirrors
`upstream/main`; `dev` integrates personal client features. Product changes live
here, while update/build/install automation remains in `happy-manager`.

## Personal feature rules

- Branch personal features from `dev`, never from `main`.
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
