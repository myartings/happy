# Context: `hardware-keyboard-enter-send`

`context.md` is the human-readable overview. The machine-readable, role-scoped
manifests are:

- `contexts/implement.jsonl`
- `contexts/check.jsonl`

Each JSONL entry contains a repository-relative `path` and a non-empty `reason`.
Keep each role limited to the files it actually needs.

## Implementation context

- Existing native multiline input: `packages/happy-app/sources/components/MultiTextInput.tsx`.
- Existing session send/autocomplete path: `packages/happy-app/sources/components/AgentInput.tsx`.
- Existing new-session start path: `packages/happy-app/sources/app/(app)/new/index.tsx`.
- App-local native module boundary: `packages/happy-app/modules/hardware-keyboard-command/`.

## Verification context

- Focused policy and wiring tests, happy-app typecheck, Expo autolinking
  inspection, and a required physical-iPad smoke matrix.

## Notes

- `docs/ARCHITECTURE.md` is absent in this repository; `CONTEXT.md`, the feature
  spec, and inspected source are the architecture boundary.
- No generated `packages/happy-app/ios/**` or `android/**` files may be edited.
