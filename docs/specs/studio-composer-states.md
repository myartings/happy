# Studio Composer State Presentation Contract

## Status

Accepted for isolated implementation by the user's 2026-08-13 instruction to
continue the next parallel Studio UI batch. Integrated packaged-desktop images
remain subject to explicit human visual acceptance.

## Scope

Refine the existing Happy composer state presentation for packaged Desktop
`Studio` without changing its functional footprint. The batch owns only:

- `packages/happy-app/sources/components/AgentInput.tsx`
- `packages/happy-app/sources/components/AgentInputAttachmentStrip.tsx`
- `packages/happy-app/sources/components/AgentInputAutocomplete.tsx`
- `packages/happy-app/sources/components/AgentInputSuggestionView.tsx`
- `packages/happy-app/sources/features/studio-composer/**`

Tools, conversation and Markdown rendering, sidebar, shared Studio activation,
Command Palette, and other overlays are excluded.

## Observable behavior

1. The empty Studio composer remains quiet, with its existing placeholder and
   controls, while the inactive primary action is visibly subordinate.
2. Typed text or an attachment gives the Studio shell a clear ready state and
   an unambiguous enabled send action without moving any control.
3. Attachments use the existing compact preview size but gain a bounded,
   aligned strip surface and a clear remove affordance.
4. Autocomplete uses compact fixed-pitch rows with a visible selected state,
   quiet unselected state, and preserved mouse and arrow-key selection.
5. Opening permission/model/effort selection gives its existing trigger and
   choice row a visible active/selected state; labels and callbacks are
   unchanged.
6. Sending, abort-available, and abort-in-progress states are visually distinct
   while retaining the existing send, stop, spinner, and error behavior.
7. Control order, keyboard semantics, callbacks, attachments, voice/image/
   settings actions, and accessibility roles remain unchanged.
8. Default, standalone Web, iOS, Android, and all non-Tauri runtimes remain on
   the existing presentation path.

## Verification

- Resolver tests cover empty, ready, attachment, autocomplete, sending, abort,
  and picker-active presentations plus all non-Studio fallbacks.
- Wiring tests inspect the owned components to prove resolved state metrics are
  connected to the shell, action, attachment, autocomplete, and picker seams.
- Existing primary-action and composer tests remain green.
- Happy App typecheck and repository workflow checks pass.
- The parent integration session builds the packaged Tauri client and presents
  representative empty, typed, attachment/autocomplete, and sending/abort
  states for human acceptance.

## Non-goals

- No new controls, callbacks, commands, persistence, or protocol behavior.
- No layout reordering or broad composer geometry redesign.
- No mobile or standalone Web visual changes.
- No edits to files owned by the other parallel tracks.
