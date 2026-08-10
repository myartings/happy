# Context: `prompt-rail-reliable-jump`

`context.md` is the human-readable overview. The machine-readable, role-scoped
manifests are:

- `contexts/implement.jsonl`
- `contexts/check.jsonl`

Each JSONL entry contains a repository-relative `path` and a non-empty `reason`.
Keep each role limited to the files it actually needs.

## Implementation context

- Prompt-rail selection is handled in `packages/happy-app/sources/components/ChatList.tsx`.
- Web target retries will be isolated in `packages/happy-app/sources/utils/webMessageReveal.ts`.

## Verification context

- Targeted Vitest coverage lives beside the utility in
  `packages/happy-app/sources/utils/webMessageReveal.test.ts`.

## Notes

- Scope is limited to cancelling stale web reveal retries when a newer prompt
  selection supersedes them.
