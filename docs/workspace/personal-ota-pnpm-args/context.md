# Context: `personal-ota-pnpm-args`

`context.md` is the human-readable overview. The machine-readable, role-scoped
manifests are:

- `contexts/implement.jsonl`
- `contexts/check.jsonl`

Each JSONL entry contains a repository-relative `path` and a non-empty `reason`.
Keep each role limited to the files it actually needs.

## Implementation context

- See `contexts/implement.jsonl`.

## Verification context

- See `contexts/check.jsonl`.

## Notes

- Hosted run `31334658443` passed every preflight and fingerprint step, then
  failed before publication because the workflow invoked `pnpm run ... --
  --platform`, forwarding the first `--` to EAS CLI as an unexpected argument.
- No EAS Update was published by the failed run.
