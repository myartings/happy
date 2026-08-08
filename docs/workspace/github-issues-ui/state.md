# Workflow State: `github-issues-ui`

**Phase**: archived
**Intensity**: feature
**Updated**: 2026-08-08
**Owner**: AI coding session

## Next action

- [ ] Configure a test GitHub App, apply migration, and run live phone/tablet/desktop OAuth and destructive-action smoke checks

## Gate summary

| Gate | Status | Evidence |
| --- | --- | --- |
| acceptance | passed | docs/specs/github-issues-ui.md; docs/tasks/github-issues-ui-tasks.md |
| decisions | passed | D1-D4 accepted in decisions.md; authorization recorded in ADR 0005 |
| scoping | passed | Feature-local app and server modules with six-operation Happy DTO seam; guarded host integration; Project Todos unchanged |
| risk | passed | GitHub tokens remain encrypted server-only; fine-grained selected-repository permissions; permanent delete capability-gated; client and server switches default off |
| implementation | passed | Feature-gated app/server MVP implemented with encrypted GitHub App token refresh, normalized Issue adapter, cross-platform entries, and targeted tests |
| check | accepted_gaps | App/server typechecks and 20 targeted tests pass; full app suite passes; full server suite 102/103 with unrelated attachment local-download failure reproduced alone; live GitHub App/device E2E unavailable |
| review | passed | Whole diff reviewed against spec, task, ADR, security, compatibility, rollback, tests, and feature isolation; no blocking finding remains |
| finish | accepted_gaps | Implementation complete; live GitHub App migration/OAuth/device smoke and one unrelated server test remain explicit gaps |

## Phase history

| Date | Event | Phase/gate | Evidence |
| --- | --- | --- | --- |
| 2026-08-08 | created | planning | Workflow created |
| 2026-08-08 | gate | acceptance | docs/specs/github-issues-ui.md; docs/tasks/github-issues-ui-tasks.md |
| 2026-08-08 | gate | decisions | D1-D4 accepted in decisions.md; authorization recorded in ADR 0005 |
| 2026-08-08 | gate | risk | GitHub tokens remain encrypted server-only; fine-grained selected-repository permissions; permanent delete capability-gated; client and server switches default off |
| 2026-08-08 | gate | scoping | Feature-local app and server modules with six-operation Happy DTO seam; guarded host integration; Project Todos unchanged |
| 2026-08-08 | transition | implementation | Implement server Issue adapter and guarded cross-platform client vertical slices |
| 2026-08-08 | gate | implementation | Feature-gated app/server MVP implemented with encrypted GitHub App token refresh, normalized Issue adapter, cross-platform entries, and targeted tests |
| 2026-08-08 | transition | verification | Run final checks, whole-diff review, staged workflow CI, and archive |
| 2026-08-08 | gate | check | App/server typechecks and 20 targeted tests pass; full app suite passes; full server suite 102/103 with unrelated attachment local-download failure reproduced alone; live GitHub App/device E2E unavailable |
| 2026-08-08 | gate | review | Whole diff reviewed against spec, task, ADR, security, compatibility, rollback, tests, and feature isolation; no blocking finding remains |
| 2026-08-08 | transition | finish | Finalize records, archive with commit pending, and run staged workflow CI |
| 2026-08-08 | gate | finish | Implementation complete; live GitHub App migration/OAuth/device smoke and one unrelated server test remain explicit gaps |
| 2026-08-08 | archived | archived | Implemented default-off Happy GitHub Issues MVP with fine-grained GitHub App authorization, server proxy, token refresh, cross-platform UI, and contextual session routing; commit: pending; follow-up: Configure a test GitHub App, apply migration, and run live phone/tablet/desktop OAuth and destructive-action smoke checks |

## Archive

- Archived at: `2026-08-08T12:52:32+00:00`
- Result commit: `pending`
- Summary: Implemented default-off Happy GitHub Issues MVP with fine-grained GitHub App authorization, server proxy, token refresh, cross-platform UI, and contextual session routing
- Follow-up: Configure a test GitHub App, apply migration, and run live phone/tablet/desktop OAuth and destructive-action smoke checks
