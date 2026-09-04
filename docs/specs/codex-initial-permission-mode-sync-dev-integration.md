# Codex Initial Permission Mode Sync `dev` Integration Specification

## Intent

Produce an auditable two-parent integration of the reviewed permission-mode fix
with current personal `dev`, preserving both launch initialization and reconnect
permission revision behavior.

## Scope

- Merge source `910097e4` with target `b6a79dbe` without rewriting history.
- Resolve only `runCodex.ts` and `apiSession.test.ts`, retaining both intents.
- Add exactly one checked, reviewed, canonical integration Workspace.
- Push the feature branch, create a PR targeting `dev`, wait for required hosted
  checks, merge normally, and fast-forward local `dev`.

## Non-goals

- New product behavior, refactoring, server/daemon changes, or unrelated repair.
- Changes to official `main` or `upstream/main`.
- Rebase, reset, amend, force-push, branch deletion, release, deployment, or install.

## Acceptance criteria

| ID | Verifiable outcome | Required evidence |
| --- | --- | --- |
| INT-001 | The integration commit has `910097e4` and `b6a79dbe` as its two parents. | Commit-parent inspection and committed-range CI. |
| INT-002 | Relative to target parent, product changes are exactly the reviewed eight-file permission-mode fix and no conflict marker remains. | Target-relative diff/status inspection. |
| INT-003 | Launch-pinned initialization, fresh permission metadata, reconnect hydration, fail-closed environment handling, stale confirmed-route clearing, and CAS revision preservation all work together. | Focused tests, CLI typecheck, and full CLI tests. |
| INT-004 | The complete staged candidate passes configured applicable checks and independent capable Spec/Standards review. | Structured check receipt and review conclusions. |
| INT-005 | Pre/post-archive staged CI and committed-range CI pass; feature branch is pushed and normally merged by PR into `dev`, whose local/remote tips are synchronized. | CI output, remote SHA, PR/check state, and final divergence counts. |

Any failure blocks publication. Target movement or additional conflict requires a
fresh bounded integration decision and never authorizes history rewriting.
