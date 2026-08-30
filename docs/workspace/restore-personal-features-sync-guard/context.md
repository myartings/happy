# Context: `restore-personal-features-sync-guard`

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

Restore an always-visible Settings entry for personal Happy feature switches and
prevent `happyctl sync-dev` from publishing, building, or installing a `dev`
integration that loses that surface during an upstream merge.

## Acceptance criteria

1. Settings visibly exposes a Personal Features row without requiring Developer
   Mode.
2. One dedicated personal feature screen controls every currently supported
   personal switch using its existing persisted key.
3. Developer Tools links to the same screen instead of owning a duplicate copy.
4. The sync guard rejects a final `dev` tree that is missing the screen module,
   route, Settings entry, or any protected personal switch.
5. The guard runs after local patch-stack integration and before push, build, or
   install.
6. Targeted UI wiring, guard smoke tests, Happy App typecheck, and repository
   workflow checks pass.

## Scope

- Personal settings screen module and two narrow host seams.
- Existing Flat Session List runtime preference wiring.
- `happyctl` final-branch pre-push validation and deterministic smoke coverage.
- Workflow evidence for implementation, verification, review, and rollback.

## Out of scope

- Changing personal feature defaults or persisted keys.
- Migrating local settings to synced settings.
- Restoring removed official experimental settings.
- Synchronizing, pushing, committing, or installing the client in this task.

## Rollback

Revert the personal screen/route/entry and guard changes together. No data
migration or stored preference rewrite is involved. A guard failure leaves the
local integration unpushed and the installed client untouched.
