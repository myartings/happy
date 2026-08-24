# Context: `restore-flat-session-list-toggle`

`context.md` is the human-readable overview. The machine-readable, role-scoped
manifests are:

- `contexts/implement.jsonl`
- `contexts/check.jsonl`

Each JSONL entry contains a repository-relative `path` and a non-empty `reason`.
Keep each role limited to the files it actually needs.

## Goal

Restore the personal Flat Session List preference that was lost while merging
official commit `acc2289c3` into `dev`.

## Acceptance criteria

1. Features settings visibly expose the Flat Session List switch.
2. The home session list reads `flatSessionList` instead of forcing the flat
   layout on.
3. Existing persisted values and the grouped-list default remain unchanged.
4. A regression test fails if either the switch or runtime setting read is
   removed again.

## Scope

- Settings UI wiring.
- Session-list layout selection wiring.
- Focused regression coverage.
- Commit, PR merge to `dev`, and Windows desktop reinstall/launch verification.

## Out of scope

- Changing flat-list presentation or sorting behavior.
- Changing synced settings, migrations, protocols, or official `main`.

## Implementation context

- See `contexts/implement.jsonl`.

## Verification context

- See `contexts/check.jsonl`.
