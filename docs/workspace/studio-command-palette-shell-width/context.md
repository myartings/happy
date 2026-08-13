# Context: `studio-command-palette-shell-width`

`context.md` is the human-readable overview. The machine-readable, role-scoped
manifests are:

- `contexts/implement.jsonl`
- `contexts/check.jsonl`

Each JSONL entry contains a repository-relative `path` and a non-empty `reason`.
Keep each role limited to the files it actually needs.

## Implementation context

- See `contexts/implement.jsonl`.
- Bug contract: packaged Studio screenshot proves the outer Palette remains about
  800 pt wide despite a 640 pt resolver value. Make the actual outer modal wrapper
  width `min(viewport width × 0.9, 640)` for Studio Tauri.
- Preserve the existing 90%/800 pt Default path, all commands and dismissal/motion
  behavior, and native/standalone-Web behavior.
- Allowed product scope: `CommandPaletteModal.tsx`, its existing render test, and
  the Studio presentation resolver only if a contract adjustment is required.
- Visual re-verification remains parent-owned.

## Verification context

- See `contexts/check.jsonl`.
- Prove a large viewport renders the actual outer Animated wrapper at 640 and a
  smaller viewport renders it at 90%; then run nearby Palette tests, typecheck,
  workflow checks, and whole-diff review.

## Observed evidence and root cause

- `revision-2/command-palette-dense.png` shows the density and scrim changes but
  retains the original ~800 pt x bounds.
- Both wrapper and inner shell still begin from static `width: '90%'` / `maxWidth:
  800` styles. Appending a dynamic `maxWidth` was observable in the renderer test
  but did not constrain the packaged React Native Web Animated layout.
- The narrow fix is an explicit live-viewport numeric width on the outer wrapper,
  not another resolver-only assertion.
