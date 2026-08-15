# Journal: `studio-desktop-default`

## `2026-08-15`

- Started workflow.
- Diagnosed the old-looking fresh package as a selection-policy and
  build-export mismatch, not a stale source checkout.
- RED proved five missing behaviors; GREEN centralized forced Studio
  for Tauri, retained non-Tauri Default, kept old settings parseable, and embedded
  Studio in the production Expo export.
- Fresh isolated build and runtime capture showed the Studio sidebar
  while the separately installed old process remained running.
