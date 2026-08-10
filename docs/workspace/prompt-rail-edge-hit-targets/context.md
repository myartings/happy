# Context: `prompt-rail-edge-hit-targets`

`context.md` is the human-readable overview. The machine-readable, role-scoped
manifests are:

- `contexts/implement.jsonl`
- `contexts/check.jsonl`

Each JSONL entry contains a repository-relative `path` and a non-empty `reason`.
Keep each role limited to the files it actually needs.

## Implementation context

- Desktop rail pointer targets live in
  `packages/happy-app/sources/components/SessionPromptHistoryNavigator.tsx`.
- Shared geometry contracts live in
  `packages/happy-app/sources/utils/sessionPromptHistory.ts`.

## Verification context

- Geometry regression coverage lives in
  `packages/happy-app/sources/utils/sessionPromptHistory.test.ts`.

## Notes

- Scope is limited to preventing arrow hit slop from overlapping the adjacent
  prompt track at either edge.
