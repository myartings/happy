# Finish Review: `codex-initial-permission-mode-sync-dev-integration`

## Summary

Resolved the two code conflicts between permission-mode commit `910097e4` and
`dev@b6a79dbe`. The result keeps `dev`'s launch-pinned initialization and
awaitable metadata publication while preserving reconnect hydration,
permission revision CAS behavior, and fail-closed credentials. Remediation also
clears a prior process's confirmed model/effort while the new launch is pending.

## Verification

- Focused conflict integration: 92 tests passed; CLI typecheck passed.
- TDD remediation: expected RED reproduced stale effective-route retention;
  GREEN passed 74 focused tests and CLI typecheck.
- Full post-remediation CLI: 103 files / 1046 tests passed.
- Final candidate-bound profile: 9/9 commands passed, including App 1951/1951,
  Server 112/112, workflow runtime 40/40, validators, and strict audit.
- Review package candidate `916195c27349…` binds source `910097e4`, target
  `b6a79dbe`, and zero unmerged entries.

## Whole-diff review

Independent High-risk-profile Spec and Standards reviewers accepted the same
remediated candidate. Standards' initial stale-route finding was fixed through
RED/GREEN and cleared on fresh review; no blocker or accepted gap remains.

## Rollback or mitigation

The delivery is one ordinary two-parent integration commit followed by a normal
PR merge. Before PR merge, publication can stop with the remote feature branch
intact; after merge, either merge can be reverted as an auditable unit. There is
no migration, deployment, credential, or persistent runtime-state rollback.

## Lessons promoted

- `CONTEXT.md`: none; no broad project context changed.
- `docs/ARCHITECTURE.md` or ADR: none; the behavior is captured by the feature
  and integration specs.
- Skill/workflow rule: none; merge-local lifecycle enforcement worked as intended.

## Follow-up

- Generate the terminal archive projection, create the authorized two-parent
  merge commit, and run committed-range CI against `b6a79dbe`.
- Push without force, create a PR targeting `dev`, wait for hosted checks, merge
  normally, and fast-forward local `dev`.
- No non-blocking product follow-up was found.
