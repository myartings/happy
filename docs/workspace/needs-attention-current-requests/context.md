# Context: `needs-attention-current-requests`

`context.md` is the human-readable overview. When an accepted task actually
dispatches implementation or verification work, materialize only the needed
machine-readable, role-scoped manifests:

- `contexts/implement.jsonl`
- `contexts/check.jsonl`

Each JSONL entry contains a repository-relative `path` and a non-empty `reason`.
Keep each role limited to the files it actually needs.

Do not create these files for serial work that remains in the current context.

## Implementation context

- Current Root owns serial implementation in this confirmed Issue worktree.
- Primary seams: `packages/happy-app/sources/sync/storage.ts`,
  `packages/happy-app/sources/utils/visibleSessionListViewData.ts`, Session row
  components, `packages/happy-app/sources/hooks/useNavigateToSession.ts`, and
  the Session destination route/view.
- Shared pure behavior belongs under
  `packages/happy-app/sources/features/needs-attention/`.

## Verification context

- Current Root runs incremental focused tests; final verification and review use
  the complete accepted candidate and the commands in `validation.md`.

## Notes

- No role manifest is required because implementation is serial in the current
  Root context.
- Runtime scope containment follows
  `docs/workflow/discovered-work-scope-containment.md`; terminal outcomes, Goal
  state, provider behavior, new response paths, and tracker mutations have no
  owning authority in this Workspace.
