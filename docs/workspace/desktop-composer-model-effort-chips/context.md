# Context: `desktop-composer-model-effort-chips`

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

## Goal

Show the active model and reasoning-effort values as two compact, independently
clickable labels in the packaged desktop Studio session composer.

## Acceptance contract

- The packaged desktop Studio composer shows the resolved model name whenever
  one is available and the resolved effort name whenever one is available.
- Selecting the model label opens the existing model picker; selecting the
  effort label opens the existing effort picker.
- A label remains visible but disabled when its current value is known and the
  session does not permit changing that field.
- Zen mode and the existing compact mobile composer remain unchanged.
- The implementation is presentation-only: no session protocol, persistence,
  synchronization, or account-setting changes.

## Ownership boundary

- Product writes are limited to `AgentInput.tsx` and
  `features/studio-composer/**`.
- Existing model/effort resolution and mutation paths remain authoritative.
- Stop if the implementation requires protocol or synchronized-state changes.
