# Journal: `github-issues-missing-config-entry`

## `2026-08-11`

- Started workflow.
- Reproduced the installed macOS behavior through the UI: Session entry opened a
  `lookup-failed` picker with no repositories; the settings route reported the
  build was missing GitHub Issues App configuration.
- Confirmed the installed app was built from `c7244a65` and already contained the
  recent Session repository-resolution fixes.
- Added red-first coverage for disconnected and unavailable connection states,
  then routed those states to the existing connection screen before repository
  resolution. Repository-discovery reauthorization errors follow the same recovery
  path. All 70 GitHub Issues tests and app typecheck pass.
- Added the missing macOS/Linux Manager build guard and documented both required
  public identifiers in `config.example.env`; shell syntax, iOS smoke, and the
  fail-closed probe pass.
