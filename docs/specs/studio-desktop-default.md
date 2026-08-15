# Studio Desktop Default

## Outcome

The personal packaged Tauri client always presents the Studio visual system. A
historic device-local `visualStyle: default` value or a stale build environment
must not silently return the personal desktop app to the upstream appearance.

The existing Default render paths remain in source for upstream compatibility and
for non-Tauri clients. This change removes their authority over the personal
packaged desktop; it does not delete or broadly rewrite them.

## Acceptance criteria

1. `resolveDesktopVisualStyle` returns `studio` for every Tauri runtime, including
   persisted `requestedStyle: default` and `previewStyle: default` inputs.
2. Non-Tauri clients continue to resolve `default`, even when Studio is requested
   or supplied through the preview environment.
3. New and legacy local-settings payloads parse successfully with Studio as the
   compatibility default; a persisted Default value remains schema-valid but is
   inert in Tauri.
4. The Tauri production export explicitly sets
   `EXPO_PUBLIC_HAPPY_VISUAL_STYLE=studio` using the repository's cross-platform
   `cross-env` dependency and clears the Expo export cache.
5. Existing Default component implementations remain available; the change is
   bounded to policy, local compatibility defaults, build configuration, and tests.
6. Focused tests, Happy App typecheck, applicable workflow checks, and a fresh
   packaged Tauri build pass.
7. The freshly installed personal desktop app renders Studio even when the device
   previously stored `visualStyle: default`.

## Non-goals

- Delete Default render branches.
- Change theme preference (light/dark/adaptive).
- Change Web, iOS, or Android presentation.
- Migrate synchronized account data or alter session protocols.
