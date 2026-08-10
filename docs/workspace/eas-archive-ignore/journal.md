# Journal: `eas-archive-ignore`

## `2026-08-10`

- Started workflow.
- Inspected the prior archive: 2.1 GB unpacked locally, dominated by a 1.9 GB
  `.baseline` worktree plus Git metadata and desktop/CLI build artifacts.
- Added conservative EAS exclusions while preserving root workspace inputs.
- A clean install from the first optimized archive exposed that Happy CLI's
  workspace postinstall requires `tools/archives`; restored those inputs and
  retained only the safe `tools/unpacked` exclusion.
- Final EAS inspection measured 138 MB unpacked. Clean workspace installation,
  CLI postinstall, Happy Wire build, and Happy App typecheck passed from the
  exact archive contents.
