# Workflow State: `restore-grouped-session-list-default`

**Phase**: archived
**Intensity**: low-risk
**Updated**: 2026-08-23
**Owner**: AI coding session

## Next action

- [ ] Merge into dev, rebuild, reinstall, and visually smoke

## Gate summary

| Gate | Status | Evidence |
| --- | --- | --- |
| acceptance | passed | docs/specs/restore-grouped-session-list-default.md requires grouped compact layout for new and existing clients while preserving later explicit opt-in |
| decisions | not_required | A parser-level one-time local migration is the smallest deterministic way to repair persisted true values without removing the optional feature |
| scoping | passed | Two product files plus low-risk workflow evidence; public seam is localSettingsParse and installed-client visual smoke |
| risk | not_required | Device-local boolean migration only; no protocol, authentication, remote data, or protected path changes |
| implementation | passed | TDD RED reproduced persisted flat-list true; one-time parser migration restores grouped layout, defaults new clients to grouped, and preserves later opt-in; related 41/41 and App typecheck pass |
| check | passed | Related App tests 41/41, App typecheck, and git diff check passed; installed-client smoke is mandatory post-merge because Manager packages dev |
| review | passed | Whole-diff review found no remaining issue: device-local parser migration is bounded, idempotent, and preserves later explicit opt-in |
| finish | passed | Finish review records validation, rollback, no learning promotion, and mandatory installed-client visual smoke |

## Phase history

| Date | Event | Phase/gate | Evidence |
| --- | --- | --- | --- |
| 2026-08-23 | created | planning | Workflow created |
| 2026-08-23 | gate | acceptance | docs/specs/restore-grouped-session-list-default.md requires grouped compact layout for new and existing clients while preserving later explicit opt-in |
| 2026-08-23 | gate | decisions | A parser-level one-time local migration is the smallest deterministic way to repair persisted true values without removing the optional feature |
| 2026-08-23 | gate | risk | Device-local boolean migration only; no protocol, authentication, remote data, or protected path changes |
| 2026-08-23 | gate | scoping | Two product files plus low-risk workflow evidence; public seam is localSettingsParse and installed-client visual smoke |
| 2026-08-23 | transition | implementation | Add RED migration regression, implement one-time grouped-default restoration, then verify |
| 2026-08-23 | gate | implementation | TDD RED reproduced persisted flat-list true; one-time parser migration restores grouped layout, defaults new clients to grouped, and preserves later opt-in; related 41/41 and App typecheck pass |
| 2026-08-23 | transition | verification | Review full diff, validate workflow evidence, then prepare integration |
| 2026-08-23 | gate | check | Related App tests 41/41, App typecheck, and git diff check passed; installed-client smoke is mandatory post-merge because Manager packages dev |
| 2026-08-23 | gate | review | Whole-diff review found no remaining issue: device-local parser migration is bounded, idempotent, and preserves later explicit opt-in |
| 2026-08-23 | transition | finish | Archive with commit pending, integrate through dev, rebuild, reinstall, and visually smoke |
| 2026-08-23 | gate | finish | Finish review records validation, rollback, no learning promotion, and mandatory installed-client visual smoke |
| 2026-08-23 | archived | archived | Restore grouped compact session list for new and existing clients; commit: pending; follow-up: Merge into dev, rebuild, reinstall, and visually smoke |

## Archive

- Archived at: `2026-08-23T12:56:54+00:00`
- Result commit: `pending`
- Summary: Restore grouped compact session list for new and existing clients
- Follow-up: Merge into dev, rebuild, reinstall, and visually smoke
