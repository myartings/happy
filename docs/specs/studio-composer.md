# Studio Composer First-Batch Contract

## Status

Accepted for isolated implementation by the user's 2026-08-13 parallel Studio
UI authorization. The resulting packaged-desktop image still requires explicit
human visual acceptance.

## Scope

Refine the existing Happy composer region for the packaged Desktop `Studio`
visual style. Preserve the composer's place in the conversation, every existing
control, and all send, abort, voice, attachment, permission, model, effort,
agent, Git-status, and autocomplete behavior.

The batch owns only:

- `AgentInput.tsx`
- `AgentInputAttachmentStrip.tsx`
- `AgentInputAutocomplete.tsx`
- `AgentInputSuggestionView.tsx`
- `features/studio-composer/**`

`PermissionModeSelector`, floating-overlay components, sidebar components,
conversation layout, and message rendering are explicitly excluded.

## Accepted visual behavior

At the 1470x870 reference window, the Studio composer:

1. Uses a responsive full-width container capped at 800 pt and centered in its
   existing parent region.
2. Presents one approximately 110 pt white shell with a 20 pt radius, one quiet
   neutral border, and one broad restrained elevation. It is the dominant
   persistent elevated surface.
3. Uses deliberate internal separation between the text field and compact
   bottom action row without introducing nested cards or moving controls.
4. Uses 32 pt visible action controls with compact 8 pt geometry while retaining
   existing hit slop and accessibility behavior.
5. Uses denser 52 pt Studio attachment previews and a 40 pt Studio autocomplete
   row family, both aligned to the shell's inner grid.
6. Leaves Default styling, standalone Web, iOS, Android, and all non-Tauri
   runtimes unchanged even if a Studio preview value is present.

## Verification and acceptance

- Pure resolver tests prove Studio activation and Default/non-Tauri fallbacks.
- Existing composer behavior tests and Happy app typecheck remain green.
- Diff review confirms no excluded product file changes.
- A packaged Desktop screenshot at the reference state is presented to the user.
  Automated checks do not substitute for that human visual acceptance.
