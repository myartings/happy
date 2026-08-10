# Decisions: `eas-archive-ignore`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | Where should the ignore file live? | resolved | Use repository-root `.easignore`; local `eas build:inspect` showed that the archive root is the Happy Git worktree. |
| D2 | How aggressive should package exclusion be? | resolved | Preserve the pnpm monorepo and source packages. Exclude only Git/local worktrees, desktop-only Tauri files, and locally unpacked CLI tools. A clean archive install proved that `happy-cli/tools/archives` must remain for the CLI workspace postinstall. |
| D3 | How should existing ignore behavior be preserved? | resolved | Copy the applicable `.gitignore` rules because EAS uses `.easignore` instead of layering both files. |
| D4 | Is another cloud build required? | resolved | No. Use EAS `build:inspect --stage archive` to deterministically verify the upload contents; do not consume another build solely for archive tuning. |
