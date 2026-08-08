# Happy Selective Workflow Adoption

## Goal

Adopt the enforceable execution core of `ai-coding-template` for personal Happy
feature development without replacing upstream-owned instructions, skills,
product CI, release behavior, or the clean `main` branch.

## Scope

- Add Happy-specific project commands, risk triggers, protected paths, and the
  `myartings/happy` tracker target under `.ai/project.json`.
- Add the structured workflow runtime, templates, documentation, and mirrored
  Agent skills through a dry-run-first selective adoption manifest.
- Preserve every pre-existing Happy skill and append a small personal-feature
  section to the existing root `AGENTS.md`.
- Validate the adoption boundary and workflow runtime deterministically.

## Non-goals

- Synchronizing the complete template or replacing Happy-owned root files.
- Adding template-maintenance CI, project-generation scripts, or product code.
- Changing Happy sessions, protocols, application behavior, dependencies, or
  release automation.
- Committing or pushing the result without a separate request.

## Branch contract

- `main` remains clean and tracks `upstream/main`.
- This adoption lands on a personal branch based on `origin/dev`.
- Future personal features branch from `dev` and keep upstream integration
  points small and explicit.

## Acceptance criteria

1. The original Happy worktree on `main` remains clean and unchanged.
2. The adoption lives on `myartings/workflow-adoption`, based on `origin/dev`.
3. Existing Happy Agent and Claude skills remain present and unmodified.
4. The selective manifest excludes template root instructions, template CI,
   project generation, full synchronization, and template-maintenance checks.
5. Happy has real pnpm setup, typecheck, and test commands plus deterministic
   workflow-core checks in `.ai/project.json`.
6. A formal workflow can be created, gated, verified, reviewed, finished, and
   archived using repository-local scripts.
7. Workflow runtime tests, selective-adoption validation, strict audit, mirror
   spot checks, and staged workflow CI pass.

## Evidence map

| Criterion | Evidence |
| --- | --- |
| AC1-AC4 | Branch/worktree inspection, manifest validator, whole-diff review |
| AC5 | `.ai/project.json` inspection and applicable command execution |
| AC6 | `docs/workspace/workflow-adoption/workflow.json` history and archive row |
| AC7 | Exact commands recorded in `validation.md` |
