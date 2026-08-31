# Context: `codex-first-happy-client-latest-dev-refresh`

The already-validated Codex-first integration is committed locally as
`ddb3034e2e3006b9b70f1e38d6cced99cdef1de0`, whose second parent is the
previously pinned `dev` commit
`68cfb6f915fb25f5ecd444df2aefafeccae92fa8`. During committed validation,
`origin/dev` advanced to
`87b5385e82d96b5eaab68bc65a968cf36167e9c5` through merged PR #76 / Issue #70.

The new target adds a current-request projection to Needs Attention. It keeps
permission and agent-communication requests visible while offline, deduplicates
rows, preserves permission-before-answer-before-unread ordering, and navigates
with version-checked focus hints without sending a response from the list.

A prospective merge predicts four content conflicts:

- `docs/workspace/archive.md`
- `packages/happy-app/sources/-session/SessionView.tsx`
- `packages/happy-app/sources/components/SessionsList.tsx`
- `packages/happy-app/sources/utils/visibleSessionListViewData.ts`

The two component conflicts are import-only; their auto-merged bodies already
retain both Codex-first layout/navigation and current-request focus behavior.
The list projection has a real semantic overlap. Existing parent tests provide
the TDD seam: Codex-first requires legacy `input_required` rows to be promoted,
while current `dev` requires richer attention metadata, deduplication, strict
severity ordering, and setting-off rollback.

## Primary sources

- PR #78 and `docs/specs/codex-first-happy-client.md` define the feature being
  delivered.
- Merged PR #76, closed Issue #70, and
  `docs/specs/needs-attention-current-requests.md` define the incoming behavior.
- The two pinned Git parents and their existing tests are the source authority
  for conflict resolution.

## Boundaries

- Use normal merge commits only; no reset, rebase, amend, history rewrite, or
  force push.
- No PR merge/close, branch deletion, installation/replacement, signing,
  publication, release, protocol redesign, or unrelated baseline repair.
- A new `origin/dev` movement before delivery requires a fresh bounded
  reassessment; it does not authorize rewriting either completed merge.
