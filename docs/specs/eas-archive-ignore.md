# EAS Build Archive Exclusions

## Problem

Happy's monorepo had no `.easignore`, so an iOS Internal build uploaded an
884 MB archive. Local inspection showed that EAS included Git metadata, a
locally excluded `.baseline` worktree, desktop Rust outputs, and locally
unpacked CLI tools that are not inputs to the Expo mobile build.

## Scope

Add a repository-root `.easignore` that preserves the existing `.gitignore`
semantics and excludes only local state or platform artifacts that are not
needed to install and build `happy-app` on EAS.

## Acceptance criteria

1. EAS archive inspection excludes `.git`, `.baseline`, `.dev`, Happy App's
   desktop-only `src-tauri` tree, and locally unpacked Happy CLI tools.
2. The archive still contains the root pnpm workspace metadata, patches,
   `happy-app`, `happy-wire`, Expo configuration, and application sources.
3. The inspected archive is materially smaller than the prior 884 MB upload.
4. Happy App typechecking and workflow validation continue to pass.

## Non-goals

- Reorganizing the monorepo or changing pnpm workspace membership.
- Excluding source packages merely because the app does not directly import
  them; EAS still installs the root workspace.
- Excluding `happy-cli/tools/archives`; the CLI workspace postinstall consumes
  the platform archive during the root pnpm install.
- Triggering another paid/cloud iOS build solely to test ignore patterns.
