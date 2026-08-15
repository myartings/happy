# Context: `studio-composer-states`

`context.md` is the human-readable overview. The machine-readable, role-scoped
manifests are:

- `contexts/implement.jsonl`
- `contexts/check.jsonl`

Each JSONL entry contains a repository-relative `path` and a non-empty `reason`.
Keep each role limited to the files it actually needs.

## Goal

Make the packaged-desktop Studio composer communicate its real empty, ready,
attachment, autocomplete, picker, sending, and abort states with the restrained
visual language of the accepted first Studio batch.

## Implementation context

- See `contexts/implement.jsonl`.

## Verification context

- See `contexts/check.jsonl`.

## Ownership boundary

- Product writes are limited to the four assigned `AgentInput*` components and
  `features/studio-composer/**`.
- Shared Studio activation is read-only.
- Tools, conversation/Markdown, sidebar, overlays/Command Palette, and parent
  workflow files belong to other parallel tracks.

## Batch plan

- Writer: this isolated branch and worktree only.
- Dependency: accepted Studio composer baseline at local `dev` commit
  `f6617997`; no shared contract changes.
- Parent owns cherry-pick order, integration build, screenshot capture, and
  final human acceptance.
- Stop if a required implementation crosses the product ownership boundary.

## Human gate

Deterministic checks may close this child workflow, but visual acceptance of
the integrated packaged client belongs to the user in the parent session.
