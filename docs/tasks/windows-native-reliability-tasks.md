# Windows Native Reliability Tasks

## T1 — Freeze native baseline and reproduce recorded gaps

Status: completed.

- Scope: capture repository/system state; verify the worktree base; run native
  parser, doctor, happy-wire, and focused/full CLI commands before behavior
  changes.
- Allowed files: `docs/workspace/windows-native-reliability/**`.
- Depends on: none.
- Acceptance: exact environment, command, exit status, and failure output are
  recorded; unavailable dependencies are distinguished from product failures.
- Closest validation: baseline JSON snapshot, PowerShell AST parser, package
  commands.

## T2 — Add the self-contained Windows happyctl smoke entry

Status: completed.

- Scope: create an assertion-based PowerShell 5.1 suite using owned temporary
  fixtures for Node resolution, doctor orchestration, Git guards, artifacts,
  and dry-run invariants.
- Allowed files: `devtools/tests/happyctl-windows-smoke.ps1`, narrow test seams
  in `devtools/happyctl.ps1` only if a RED assertion proves they are needed,
  `devtools/README.md`, workflow evidence.
- Depends on: T1.
- Acceptance: the new suite initially exposes any real contract failures, never
  touches real external state, and parses under 5.1.
- Closest validation: canonical smoke invocation under Windows PowerShell 5.1.

## T3 — Correct the reproducible happy-wire Windows package script

Status: completed.

- Scope: replace only the shell-specific package-script behavior proven by T1.
- Allowed files: `packages/happy-wire/package.json`, workflow evidence.
- Depends on: T1.
- Acceptance: the same standard package test that failed on `$npm_execpath`
  passes on native Windows without changing build/test meaning.
- Closest validation: `pnpm --filter @slopus/happy-wire test`.

## T4 — Close the reproducible native CLI baseline

Status: completed.

- Scope: make sandbox and path tests explicitly exercise their intended host
  behavior, and fix only production launcher/path-classification failures that
  the complete Windows baseline reproduces.
- Allowed files: focused tests under `packages/happy-cli/src/` and
  `packages/happy-cli/scripts/`; `packages/happy-cli/scripts/ripgrep_launcher.cjs`;
  `packages/happy-cli/scripts/claude_version_utils.cjs`; workflow evidence.
- Depends on: T1 and deterministic dependency setup.
- Acceptance: all 34 native RED assertions are captured and closed; sandbox
  wrapping/skip behavior is truthful; fixture expectations use native paths;
  packaged `rg.exe` fallback and cross-platform Claude path classification have
  regression coverage; the complete CLI suite passes.
- Closest validation: focused Vitest files followed by `pnpm --filter happy
  test`.

## T5 — Close smoke and dry-run contracts

Status: completed.

- Scope: fix only failures reproducible in T2, update operator documentation,
  and run the suite twice in both required/available PowerShell hosts.
- Allowed files: `devtools/happyctl.ps1`, `devtools/tests/**`,
  `devtools/README.md`, workflow evidence.
- Depends on: T2–T4.
- Acceptance: all acceptance IDs AC1–AC10 pass with no Pester/global dependency
  and no external-state mutation.
- Closest validation: two consecutive canonical smoke runs under 5.1; optional
  repeated `pwsh` runs.

## T6 — Run the real non-installing Windows build

Status: completed.

- Scope: use an explicit temporary config anchored to this worktree, run real
  doctor and `build-desktop`, close any stable Windows-only build-command
  failure with a smoke regression, and inspect fresh artifacts without
  installing or launching them.
- Allowed writes: ignored dependency/build outputs, devtools state logs outside
  the repository, workflow evidence.
- Depends on: T5 and strict pre-implementation/check audit.
- Acceptance: doctor/build succeed and fresh non-empty app.exe, NSIS, and MSI
  evidence is recorded; any transient Tauri override config survives Windows
  command marshalling and is cleaned after use.
- Closest validation: real happyctl commands plus artifact hash/timestamp check.

## T7 — Prove real system and repository invariants

Status: completed.

- Scope: capture the same post-verification state fields as T1 and compare them
  with the baseline, allowing only tracked Goal changes and ignored build
  outputs.
- Allowed files: workflow evidence only.
- Depends on: T6.
- Acceptance: installed executable hashes, uninstall registry values, Happy
  tasks, daemon/application status, protected Git state, and unrelated files
  show no drift.
- Closest validation: machine-readable snapshot comparison and `git status`.

## T8 — Revalidate, review, finish, and archive on latest dev

Status: in progress. PR `#68` supplied candidate-bound accepted-gap receipts.
The first dual-axis review found accepted-contract gaps in DryRun isolation,
per-family state proof, exact output, and packaged-ripgrep selection. Those
findings are now RED/GREEN and revalidated; the remediated exact candidate still
requires a new formal full-profile receipt, fresh dual-axis review, finish, and
archive.

- Scope: run applicable project checks, strict workflow audit, `git diff
  --check`, whole-diff semantic review, acceptance reconciliation, finish, and
  archive with `archive-introducing-commit` against the exact staged candidate.
- Allowed files: workflow evidence and any narrow finding fixes with rerun
  evidence.
- Depends on: T7.
- Acceptance: all reproduced Windows-only defects have regression coverage,
  remaining limitations are explicit, all workflow gates pass, and the one
  authorized delivery commit passes staged and outgoing-range CI.
- Closest validation: workflow checks/audit, complete diff review, archived
  workflow state, staged CI, and `workflow-ci.py --base origin/dev`.

## T9 — Publish the reviewed feature branch and open the dev PR

Status: blocked by T8; no Windows feature-branch remote write has occurred.

- Scope: push only `feature/windows-native-reliability`, create one PR with
  base `dev`, and verify its identity and hosted checks without merging it.
- Depends on: T8 and explicit user authorization already recorded in the
  local-only delivery source.
- Acceptance: remote head and local delivery commit match; the PR is open
  against `dev`; no protected branch, installer, registry, task, daemon, or
  installed application state changes.
- Closest validation: `git ls-remote`, `gh pr view`, and `gh pr checks`.
