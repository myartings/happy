# Journal: `windows-native-reliability`

## `2026-08-30`

- Started workflow.
- Read root and devtools instructions, `.ai/project.json`, `CONTEXT.md`, and the
  repository workflow contract.
- Verified the independent `quiet-cloud` worktree and local `dev` point to the
  same commit with no pre-existing worktree changes.
- Captured the pre-implementation Windows external-state snapshot at
  `%TEMP%\happy-windows-native-reliability\before.json` under Windows
  PowerShell 5.1.
- Confirmed current production script parses with zero 5.1 AST errors and the
  real Windows toolchain doctor passes.
- Reproduced the happy-wire package-script failure: Windows command execution
  treats literal `$npm_execpath` as an executable name.
- The initial CLI suite command was unavailable because this worktree had no
  installed dependencies; dependency setup is required before judging the
  recorded Codex sandbox assertion.
- Installed dependencies with isolated Node 20 and a frozen lockfile, then
  reproduced the complete historical Windows CLI baseline: 34 failures in six
  files, including the two Codex sandbox assertions.
- Observed that the user's persistent Windows devtools config points
  `$HappyRepo` at the main checkout; all Goal-specific real commands must use a
  temporary explicit config anchored to this worktree.
- Corrected the happy-wire package scripts to invoke the repository package
  manager directly; the public test command now builds and passes 27 tests.
- Made Claude and Codex sandbox tests state their intended platform explicitly,
  converted host-sensitive fixture paths to native resolution, and added
  dedicated Windows sandbox-skip coverage.
- Reproduced and fixed two runtime Windows seams exposed by the full CLI run:
  packaged `rg.exe` discovery/output handling and platform-neutral Claude path
  classification. Focused families and the full 93-file / 874-test suite pass.
- Added the self-contained PowerShell smoke entry and documented its canonical
  Windows PowerShell 5.1 invocation. Development REDs proved BOM-safe
  non-ASCII fixture config, complete doctor isolation, and native Git warning
  handling were required; all 8 contract groups now pass in 5.1 and 7.6.4.
- The first real worktree-anchored build exposed an additional stable Windows
  command-marshalling failure after a successful Expo export: `pnpm.cmd`
  removed quotes from the inline Tauri JSON override. Added a RED smoke
  contract, replaced inline JSON with a temporary UTF-8 config file under the
  configured state root, and proved exact content plus cleanup; the suite is
  now 9/9 under Windows PowerShell 5.1.
- The second real build passed and produced fresh app.exe, MSI, and NSIS
  artifacts without installing or launching them. Corrected a validation-only
  UTC double-conversion before recording final freshness deltas and hashes.
- Final authoritative matrices passed twice under both Windows PowerShell 5.1
  and PowerShell 7.6.4. Review hardened temporary-config cleanup and replaced a
  PowerShell function double with a real `pnpm.cmd` fixture that proves
  space+CJK argument marshalling and cleanup after both success and exit 7.
- The broad configured workflow check passed both typechecks and all workflow
  core checks. It also exposed unchanged, explicitly excluded baseline failures
  in Studio/visual app tests (17) and server local-storage tests (2); neither
  source tree has a Goal diff, so they are recorded as bounded gaps rather than
  expanded into unauthorized product work.
- Final Windows PowerShell 5.1 state capture matched the baseline across ten
  system/repository groups; only the allowlisted Goal files are dirty and all
  fresh build outputs are ignored.
- Completed T1–T8, passed whole-diff review, recorded the two explicitly
  excluded baseline families as accepted check gaps, and passed the final
  strict active workflow audit after the finish gate.
- After `dev` adopted workflow-2026.08.2, preserved the original result at
  `quiet-cloud@83f2fd665595`, reconstructed the same feature bytes from
  `dev@f97b5d73800b`, and regenerated active schema-3 evidence without rewriting
  history. Native smoke, doctor, happy-wire, CLI, typechecks, artifacts, and
  system-state invariants revalidated successfully.
- Formal staged run `f956b565-030a-4f9c-a55d-83aacfc816bc` passed seven of nine
  commands and reproduced only the unchanged `dev` App Studio/visual and Server
  local-storage baseline failures. The new runtime requires every structured
  command to pass before it can bind review/archive, so publication is stopped
  pending an explicit scope decision; no commit, push, PR, or merge occurred.
- With explicit user authorization, merged prerequisite PR `#68`, synchronized
  local `dev` to `cbf63a29bd3f03767baf5a8e6bd893ecf393ad6a`, and restored the
  indexed Windows candidate conflict-free. The original stash and recovery
  branch remain intact.
- Reproduced one additional AC5 defect in the real worktree: `doctor` treated
  CRLF source and LF installed push guards as drift even though Git-filtered
  content was identical. Added a failing contract and canonical content hash,
  then passed all 9 smoke contracts and real doctor without reinstalling or
  changing the installed guard.
- Discarded the first latest-dev external-state comparison after persistent
  logs and exact hashes proved another active worktree concurrently installed
  its own NSIS output. This Goal performed no rollback or compensating write.
- After the external writer stopped, captured a new stable baseline and reran
  both PowerShell matrices, doctor, happy-wire, the complete CLI suite, and a
  second non-installing desktop build. The build produced fresh app.exe, NSIS,
  and MSI outputs; all seven system/repository comparison groups remained
  unchanged through the complete window.
- The first schema-3 dual-axis review blocked on four accepted-contract gaps:
  a real HKCU uninstall-key read in the smoke process, one aggregate rather
  than per-family DryRun comparison, missing exact DryRun identifiers, and a
  packaged-ripgrep test that could be satisfied by hard-coded system installs.
- Added the missing assertions first. Windows PowerShell 5.1 reproduced the
  required registry-seam RED; the deterministic ripgrep fixture was already
  GREEN and now proves the packaged selection diagnostic rather than output
  alone.
- Added a narrow uninstall-entry reader without changing production registry
  semantics, substituted owned JSON entries only in the smoke process, and
  split the three DryRun families into independent 12-contract proof. Both
  PowerShell hosts passed twice, doctor passed, happy-wire passed 27/27, and
  the complete CLI passed 903/903.
- A new read-only post-remediation snapshot matched the stable baseline for
  installed hashes, uninstall values, tasks, daemon/app processes, and both
  Git hook files. No compensating or external-state write was performed.
