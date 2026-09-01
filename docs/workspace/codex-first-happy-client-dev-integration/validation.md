# Validation: `codex-first-happy-client-dev-integration`

Record exact commands and results. Never mark a check passed unless it ran.
Use `unavailable` when the configured tool is not installed or cannot execute,
and state the consequence under Remaining gaps; unavailable is not a pass.

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| `2026-08-31` | `git fetch --prune origin dev` | passed | Pinned current target at `68cfb6f915fb25f5ecd444df2aefafeccae92fa8`; branch is 19 target commits behind and one feature commit ahead. |
| `2026-08-31` | `gh pr view 78 --repo myartings/happy ...` | observed | PR is open, non-draft, base `dev`, head `e9c76eee`, and `CONFLICTING`. |
| `2026-08-31` | `git merge-tree --write-tree --name-only --messages HEAD origin/dev` | expected conflict | Only `docs/PRD.md` and `docs/workspace/archive.md` are textual conflicts; merge tree `9e6e1faa...`. |
| `2026-08-31` | `git merge --no-commit --no-ff origin/dev` | expected conflict | Began the pinned normal merge; `MERGE_HEAD` is target `68cfb6f9`; no history rewrite or commit occurred. |
| `2026-08-31` | parent-section and archive-row comparison | passed | Merged Codex section equals stage 2 exactly; Session Transport section equals stage 3 exactly; archive is the exact 94-row parent union with 0 missing, 0 extra, and 0 duplicates; conflict markers and unresolved stages are 0. |
| `2026-08-31` | `happy-workflow-state-upgrade.py ...` | passed | Official incoming helper upgraded the active Workspace from schema 1 to schema 3, preserved gates/history, and added the approved local-only source; validate and strict active audit pass. |
| `2026-08-31` | overlapping-path inspection against both parents | passed | The only paths changed by both parents are `devtools/happyctl`, `docs/PRD.md`, `docs/workspace/archive.md`, and New Session `index.tsx`. The merged code retains target project discovery/search behavior plus the feature's Codex-first layout/runtime and the two complete-pipe macOS signing reads. |
| `2026-08-31` | `pnpm install --frozen-lockfile` | passed | All nine workspace projects installed from the unchanged lockfile; happy-wire built and Prisma generated. |
| `2026-08-31` | `pnpm --filter happy-app exec vitest run sources/features/codex-first-shell` | passed | 22 files / 80 tests, including packaged desktop runtime, legacy fallback, New Session, navigation, header, attention, execution, and workspace wiring. |
| `2026-08-31` | focused App project-discovery tests | passed | `workspaceProjectDiscovery.test.ts` and `ops.workspaceProjects.test.ts`: 2 files / 20 tests. |
| `2026-08-31` | focused CLI project/transport tests | passed after dependency-order diagnosis | Project scanner and Machine RPC: 2 files / 9 tests. `apiSession.test.ts` initially could not resolve an unbuilt happy-wire `dist`; after the standard wire build, the unchanged test passed 52/52. No source edit was made. |
| `2026-08-31` | focused Server transport tests | passed | `v3SessionRoutes.test.ts` and `rpcHandler.test.ts`: 2 files / 16 tests. |
| `2026-08-31` | `pnpm --filter @slopus/happy-wire test` | passed | Standard build plus 4 files / 27 tests. |
| `2026-08-31` | Windows PowerShell 5.1 and PowerShell 7 happyctl smoke | passed | Each host passed all 12 contracts, including CJK/space paths, isolated Node, doctor, Git guards, Tauri command marshalling, and state-preserving dry runs. |
| `2026-08-31` | `pnpm --filter happy-app typecheck`; `pnpm --filter happy-server typecheck` | passed | Both configured TypeScript checks exited 0. |
| `2026-08-31` | `pnpm --filter happy-app exec vitest run` | passed | Complete App suite: 220 files / 1767 tests. |
| `2026-08-31` | `pnpm --filter happy-server test` plus focused repeat | accepted gap | Complete suite passed 14 files / 110 tests and failed the same two local attachment/avatar tests. A focused repeat failed the same 2 of 25. Both fixture blobs are byte-identical in candidate, index, `origin/dev`, and feature HEAD; native Windows resolves their POSIX `/tmp` mocks to 404. Structured run `2f6ded10-4e28-49f0-893c-7e15834bb963` binds only command index 3 to the previously accepted risk boundary. |
| `2026-08-31` | `pnpm --filter happy test` | passed after flake diagnosis | First complete run passed 902/903 and exceeded the 5 s timeout only in Claude PATH auto-discovery (5.133 s). The isolated file passed 50/50 in 1.226 s, and a fresh complete build/run passed all 93 files / 903 tests. No source edit was warranted. |
| `2026-08-31` | merged workflow-core command family | passed | State upgrade 2/2; runtime 18/18 in 475.791 s; validator 9/9; selective adoption validator and strict all-workspace audit passed. |
| `2026-08-31` | macOS signing smoke attempts from Windows | unavailable on this host | WSL cannot consume this Windows linked-worktree metadata/CRLF checkout; an LF index export under Git Bash reaches the platform branch but correctly cannot emulate `uname=Darwin`. No macOS pass is claimed; the feature's two complete-pipe changes remain exactly the already-reviewed feature delta. |
| `2026-08-31` | exact-worktree `.\\devtools\\happyctl.ps1 doctor` | passed | A deliberately nonexistent config path prevented checkout redirection. Doctor printed this worktree and passed Node 20.20.2, pnpm 10.11.0, Git guard, MSVC 2022, Rust 1.95.0 x64 MSVC, Unix tools, and WebView2 153.0.4234.8. |
| `2026-08-31` | exact-worktree `.\\devtools\\happyctl.ps1 build-desktop` | passed after bounded config diagnosis | The first attempt completed Expo export but fail-closed when the isolated config omitted two required public GitHub App identifiers. A second attempt imported only the machine config's public environment values while still disabling its repo override, then exported 7348 modules / 591 assets, compiled the optimized x64 release, and built MSI and NSIS. Nothing was installed or launched. |
| `2026-08-31` | native artifact inspection | passed | Unsigned `app.exe`: 26,554,880 bytes, SHA-256 `FA21EE7FCCC8C7E08311F15F40FAB1C82B31DBEB153DEF65E51013667E937544`; MSI: 16,646,144 bytes, `1C89797B613D68F71FEEF34BEE21B63E2349162537DD93D556D7AB995813CE9B`; NSIS: 15,037,293 bytes, `FFBFD0D38BCDC19751C78B502F5272052702D8CE58C01F1A7846CB0B1937722F`. Authenticode status is `NotSigned`, as required by scope. |
| `2026-08-31` | `git diff --check`; `git diff --cached --check`; post-build status | passed | No whitespace errors, unresolved stages, unexpected tracked build output, install, signing, or launch occurred. |
| `2026-08-31` | first pre-archive `python scripts/workflow-ci.py --staged` | blocked as intended diagnosis | The merge-aware path rejected the still-active local integration workflow and reported checkout-filtered inherited lifecycle files as rewrites. No product/test failure occurred. Existing tests cover only an already-archived source branch later merged into a target; no pending-merge local-workflow fixture exists. This is T7 RED territory, not an accepted gap. |
| `2026-08-31` | focused T7 pending-merge test before implementation | RED, 1/1 failed in 48.881 s | The public CLI fixture failed at its first pre-archive `workflow-ci.py --staged` with the expected active-task, new-workspace, `ACTIVE.md`, and CRLF-filtered template diagnostics. |
| `2026-08-31` | same focused T7 test after implementation | GREEN, 1/1 passed in 131.402 s | One real pending merge with `core.autocrlf=true` successfully carried a fresh checked/reviewed workflow through pre-archive CI, archive generation, archived staged CI, a real two-parent commit, and committed CI. |
| `2026-08-31` | existing archive plus two committed-merge runtime tests | passed, 3/3 in 186.519 s | Ordinary archived delivery, automatic second-parent source selection, and explicit first-parent source selection retain their prior behavior. |
| `2026-08-31` | `python scripts/test-happy-workflow-runtime.py` | passed, 19/19 in 666.667 s | The complete runtime family, including the new pending-merge lifecycle tracer, passed without regression. |
| `2026-08-31` | workflow upgrade/validator/audit family after T7 | passed | State upgrade 2/2; validator tests 9/9; selective adoption validator; strict all-workspace audit; working-tree and staged whitespace checks all exited 0. |
| `2026-08-31` | focused T7 inherited-lifecycle tamper assertion | passed, 1/1 in 151.517 s | In the same `core.autocrlf=true` pending merge, a staged rewrite of inherited `docs/workspace/template/context.md` was rejected through the public `workflow-ci.py --staged` seam; restoring the parent bytes then allowed pre-archive, archived-staged, and committed CI to pass. |
| `2026-08-31` | first post-T7 final review package `b51a818a...e3e7e` | blocked | Spec found one P0 accepted-contract gap: novel non-lifecycle merge bytes emitted only a notice and could pass without a local checked/reviewed workflow, contrary to D8/DI-011. The independent capable Standards context was unavailable after its single permitted retry because the selected model was at capacity; no Standards conclusion was fabricated. |
| `2026-08-31` | unreviewed novel-byte public-CLI test before enforcement | RED, 1/1 failed in 18.216 s | A real `core.autocrlf=true` pending two-parent merge staged a post-merge edit to `source.txt` with no local workflow; `workflow-ci.py --staged` incorrectly exited 0. |
| `2026-08-31` | same unreviewed novel-byte test after enforcement | GREEN, 1/1 passed in 17.749 s | The same public CLI now rejects novel non-lifecycle merge bytes unless the merge carries one local workflow whose existing pre-archive or archived checks bind the exact candidate. |
| `2026-08-31` | legal merge-local/archive/committed-parent regressions after novel-byte enforcement | passed, 4/4 in 310.564 s | The reviewed pending-merge lifecycle, ordinary archived delivery, committed automatic source selection, and explicit first-parent source selection remain green. |
| `2026-08-31` | `python scripts/test-happy-workflow-runtime.py` after review remediation | passed, 20/20 in 622.384 s | The complete runtime family includes both merge-local RED -> GREEN tracers and every prior lifecycle regression. |
| `2026-08-31` | post-remediation workflow validation family | passed | State upgrade 2/2; validator tests 9/9; selective adoption validator; strict all-workspace audit; Python compilation; and working-tree whitespace checks all exited 0. |
| `2026-08-31` | frozen candidate `03fad83b...` dual-axis review | blocked | Spec accepted and confirmed the novel-byte P0 closed. Standards found one P1: `ACTIVE.md` validation projected `os.linesep`, so Windows `core.autocrlf=false` rejected a valid LF staged/tree object. The review gate was recorded blocked before editing. |
| `2026-08-31` | refined `core.autocrlf=false` pending-merge test before implementation | RED, 1/1 failed in 48.185 s | A real pending two-parent merge carried a fresh checked/reviewed workflow and LF `ACTIVE.md` through the public CLI. Its first pre-archive staged CI failed only with `pre-archive ACTIVE projection is not canonical and unique`. |
| `2026-08-31` | same LF pending-merge test after implementation | GREEN, 1/1 passed in 108.184 s | Canonical newline semantics now admit LF independently of the Windows host newline while staged/tree object authority remains separate. Pre-archive staged, archived staged, real two-parent commit, and committed CI all passed. |
| `2026-08-31` | archive/CRLF/novel-byte/committed-parent adjacent regressions | passed, 5/5 in 307.009 s | Ordinary archived delivery, the original `core.autocrlf=true` pending merge, unreviewed novel-byte rejection, automatic second-parent source selection, and explicit first-parent source selection remain green. |
| `2026-08-31` | `python scripts/test-happy-workflow-runtime.py` after LF remediation | passed, 21/21 in 744.870 s | The complete runtime family passed, including both LF and CRLF pending-merge workflows through staged and committed CI. |
| `2026-08-31` | post-LF-remediation workflow validation family | passed | State upgrade 2/2; validator tests 9/9; selective adoption validator; strict active audit; Python compilation; and staged/unstaged whitespace checks all exited 0. |
| `2026-08-31` | fresh LF-remediated staged full-profile check | accepted gap, 8/9 commands | Structured run `6135f12d-e6b2-4273-9564-953438100f72` binds candidate `bdb823e6...e4a1b6`. Both typechecks, App 1767/1767, workflow runtime 21/21 in 734.338 s, upgrade 2/2, validator 9/9, selective validation, and strict audit passed. Only Server command index 3 reproduced the same two native-Windows POSIX `/tmp` fixture mismatches. |
| `2026-08-31` | fresh staged source scans against `origin/dev` | passed | 160 target-relative changed paths; protected 0, generated 0, binary 0, high-signal keys 0, credential-assignment candidates 0, unmerged stages 0, and staged whitespace errors 0. |

## Automated check evidence

<!-- WORKFLOW_CHECKS_START -->
| Date | Profile / group | Command | Result | Exit code | Revision / working tree | Duration |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-08-31T01:15:23+00:00 | full / typecheck | `pnpm --filter happy-app typecheck` | passed | 0 | e9c76eee00aa; working tree `0891749333de` | 8609 ms |
| 2026-08-31T01:15:30+00:00 | full / typecheck | `pnpm --filter happy-server typecheck` | passed | 0 | e9c76eee00aa; working tree `c3631f9726c6` | 6125 ms |
| 2026-08-31T01:15:45+00:00 | full / test | `pnpm --filter happy-app exec vitest run` | passed | 0 | e9c76eee00aa; working tree `9078a5e02608` | 14000 ms |
| 2026-08-31T01:15:49+00:00 | full / test | `pnpm --filter happy-server test` | failed (1) | 1 | e9c76eee00aa; working tree `45dce4373c4e` | 3390 ms |
| 2026-08-31T01:15:50+00:00 | full / check | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | e9c76eee00aa; working tree `d916392c5d46` | 140 ms |
| 2026-08-31T01:23:11+00:00 | full / check | `{python} scripts/test-happy-workflow-runtime.py` | passed | 0 | e9c76eee00aa; working tree `b8fd651752d3` | 440922 ms |
| 2026-08-31T01:23:13+00:00 | full / check | `{python} scripts/validate-happy-workflow.py` | passed | 0 | e9c76eee00aa; working tree `09054ae91c33` | 188 ms |
| 2026-08-31T01:23:14+00:00 | full / check | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | e9c76eee00aa; working tree `00c3a291e67b` | 313 ms |
| 2026-08-31T01:23:15+00:00 | full / check | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | e9c76eee00aa; working tree `1e0a5583e417` | 203 ms |
| 2026-08-31T02:41:26+00:00 | full / typecheck | `pnpm --filter happy-app typecheck` | passed | 0 | e9c76eee00aa; working tree `b83cfcae2ff1` | 12766 ms |
| 2026-08-31T02:41:35+00:00 | full / typecheck | `pnpm --filter happy-server typecheck` | passed | 0 | e9c76eee00aa; working tree `18f1a0a98e88` | 8203 ms |
| 2026-08-31T02:41:51+00:00 | full / test | `pnpm --filter happy-app exec vitest run` | passed | 0 | e9c76eee00aa; working tree `62560fe8e729` | 15203 ms |
| 2026-08-31T02:42:03+00:00 | full / test | `pnpm --filter happy-server test` | failed (1) | 1 | e9c76eee00aa; working tree `5ad6e1037c21` | 10719 ms |
| 2026-08-31T02:42:04+00:00 | full / check | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | e9c76eee00aa; working tree `05407c71b4aa` | 156 ms |
| 2026-08-31T02:52:48+00:00 | full / check | `{python} scripts/test-happy-workflow-runtime.py` | passed | 0 | e9c76eee00aa; working tree `06878e1c264a` | 643813 ms |
| 2026-08-31T02:52:49+00:00 | full / check | `{python} scripts/validate-happy-workflow.py` | passed | 0 | e9c76eee00aa; working tree `1fbcea834adc` | 141 ms |
| 2026-08-31T02:52:51+00:00 | full / check | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | e9c76eee00aa; working tree `7bbe1796ece6` | 375 ms |
| 2026-08-31T02:52:52+00:00 | full / check | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | e9c76eee00aa; working tree `4e8bd061afe5` | 203 ms |
| 2026-08-31T03:30:08+00:00 | full / typecheck | `pnpm --filter happy-app typecheck` | passed | 0 | e9c76eee00aa; working tree `a8336a968312` | 10703 ms |
| 2026-08-31T03:30:16+00:00 | full / typecheck | `pnpm --filter happy-server typecheck` | passed | 0 | e9c76eee00aa; working tree `c4ac9c6e333a` | 7188 ms |
| 2026-08-31T03:30:31+00:00 | full / test | `pnpm --filter happy-app exec vitest run` | passed | 0 | e9c76eee00aa; working tree `baf041f2ae64` | 15078 ms |
| 2026-08-31T03:30:36+00:00 | full / test | `pnpm --filter happy-server test` | failed (1) | 1 | e9c76eee00aa; working tree `a2edefba83c6` | 3844 ms |
| 2026-08-31T03:30:37+00:00 | full / check | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | e9c76eee00aa; working tree `c6f6cb42d3d0` | 187 ms |
| 2026-08-31T03:41:23+00:00 | full / check | `{python} scripts/test-happy-workflow-runtime.py` | passed | 0 | e9c76eee00aa; working tree `71bdc45a0bac` | 645125 ms |
| 2026-08-31T03:41:25+00:00 | full / check | `{python} scripts/validate-happy-workflow.py` | passed | 0 | e9c76eee00aa; working tree `3770aae59b70` | 204 ms |
| 2026-08-31T03:41:26+00:00 | full / check | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | e9c76eee00aa; working tree `f9c7d51f2af5` | 235 ms |
| 2026-08-31T03:41:27+00:00 | full / check | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | e9c76eee00aa; working tree `d831b8ea9b28` | 219 ms |
| 2026-08-31T04:32:17+00:00 | full / typecheck | `pnpm --filter happy-app typecheck` | passed | 0 | e9c76eee00aa; working tree `5a8313d6cb20` | 9796 ms |
| 2026-08-31T04:32:25+00:00 | full / typecheck | `pnpm --filter happy-server typecheck` | passed | 0 | e9c76eee00aa; working tree `bf15ecaccb8e` | 6859 ms |
| 2026-08-31T04:32:39+00:00 | full / test | `pnpm --filter happy-app exec vitest run` | passed | 0 | e9c76eee00aa; working tree `db062ca077b4` | 13890 ms |
| 2026-08-31T04:32:44+00:00 | full / test | `pnpm --filter happy-server test` | failed (1) | 1 | e9c76eee00aa; working tree `edb025e08087` | 3484 ms |
| 2026-08-31T04:32:45+00:00 | full / check | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | e9c76eee00aa; working tree `e7c5a17d3a14` | 156 ms |
| 2026-08-31T04:45:00+00:00 | full / check | `{python} scripts/test-happy-workflow-runtime.py` | passed | 0 | e9c76eee00aa; working tree `9ca04e1fdca3` | 734500 ms |
| 2026-08-31T04:45:01+00:00 | full / check | `{python} scripts/validate-happy-workflow.py` | passed | 0 | e9c76eee00aa; working tree `a6b5ce370709` | 125 ms |
| 2026-08-31T04:45:02+00:00 | full / check | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | e9c76eee00aa; working tree `412c547948bd` | 297 ms |
| 2026-08-31T04:45:04+00:00 | full / check | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | e9c76eee00aa; working tree `365ec3a1ead7` | 407 ms |
<!-- WORKFLOW_CHECKS_END -->

## Independent whole-diff review — 2026-08-31

Both read-only axes reviewed the same verified package for staged candidate
`c8f3ab3962cce49e23e584c2fda6ff202b97beab9d778dee765a6fc54cc2f804`
and whole-diff SHA-256
`2ac440b1cced0737b7fa846bb2cc9ea44622cb0152f1a6755edfe1fee2199e6a`.
The package selected the Feature profiles `spec_review_capable` and
`standards_review_capable`; neither reviewer edited or delegated.

### Spec axis

- No actionable Spec finding. The reviewer found DI-002 through DI-009
  supported without an integration-only product repair or out-of-contract
  behavior.
- The only pre-publication gap is the exact candidate-bound Server command:
  the two unchanged native-Windows POSIX `/tmp` fixtures recorded by structured
  run `2f6ded10-4e28-49f0-893c-7e15834bb963`. The specification explicitly
  permits this parent-reproduced gap and excludes Server repair from this
  integration.
- DI-001 merge-parent/commit proof and DI-010 remote SHA, clean-worktree, and PR
  state proof remain deliberately sequenced after review; the reviewer did not
  claim them complete.
- Recommended conclusion: `accepted_gaps`.

### Standards axis

- P2 follow-up candidate, non-blocking: `scripts/workflow-review.py` accepts
  `.` and `..` as syntactically valid slugs before cleanup derives a recursive
  deletion target. A separate infrastructure workflow should reject dot path
  segments and require the resolved target to be a strict child of the
  repository-specific temporary review root.
- Scope containment: candidate and `origin/dev` both use blob
  `c9eb0be72df92cad7386012655e7b3632e1bbbee` for that script, and their path
  delta is empty. The current workflow uses the ordinary slug
  `codex-first-happy-client-dev-integration`, so this target-parent defect is
  neither a candidate regression nor a binding-authority violation and does
  not block PR #78 integration.
- No other actionable Standards finding. The reviewer kept claims bounded to
  the unsigned, uninstalled Windows build and excluded merge, install, signing,
  publication, and release.
- Recommended conclusion: `accepted_gaps`.

## Independent whole-diff review — frozen candidate `03fad83b...`

Both read-only axes reviewed package `ff7eeadab2c5602f` for staged candidate
`03fad83b913f0a154527fc0c03ae258e0740bd291f478b093a320ebcbbfab021`
and whole-diff SHA-256
`54ad109fcdf64e1ccb340a88edf3593b84b186d44457f9ad2437d06fe1be54b4`.

- Spec: `accepted`. No actionable finding; the prior unreviewed novel-byte P0
  was closed and terminal DI-010 delivery proof remained correctly sequenced.
- Standards: `blocked`. One P1 found host-dependent `ACTIVE.md` comparison via
  `os.linesep`, which rejected canonical LF staged/tree evidence on Windows
  with `core.autocrlf=false`. No other blocking defect was found.
- Workflow outcome: review gate `blocked`, followed by a formal transition back
  to implementation before the LF RED -> GREEN remediation recorded above.

## Independent whole-diff review — frozen candidate `bdb823e6...`

Both new read-only axes reviewed package `ff7eeadab2c5602f` for staged candidate
`bdb823e6ad71aad65f7e486b2ab30eb0fbc387399234bf12204be39939e4a1b6`
and whole-diff SHA-256
`8028726d4de83757d9ee61843b2049c4419fc00dbba1fc3bf39e18fc4fddec65`.

- Spec: `accepted`. No actionable finding. The reviewer independently verified
  D8/DI-007/DI-011, index-authoritative merge-local enforcement, novel-byte
  binding, LF/CRLF staged and committed coverage, and the terminal sequencing
  of DI-001/DI-010.
- Standards: `accepted`. No actionable finding. The reviewer independently
  verified semantic-only newline normalization, retained Git object authority,
  inherited lifecycle and archive-union guards, candidate/check binding, and
  the absence of protected-path, secret, security, maintainability,
  architecture, or smell-baseline violations.
- Workflow outcome: both candidate-bound conclusions and the review gate are
  `accepted`; the workflow advanced to finish.

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| DI-001 | accepted gap | Normal merge is in progress with feature parent `e9c76eee00aa7320b0881a75a19f450993601773` and pinned `MERGE_HEAD` `68cfb6f915fb25f5ecd444df2aefafeccae92fa8`. The lifecycle requires archive before the real commit, so the exact two-parent commit-object check is a post-archive delivery verification, not a pre-archive claim. |
| DI-002 | verified | Exact stage-2/stage-3 section comparison and marker scan passed. |
| DI-003 | verified | Exact 94-row union comparison passed with no missing, extra, or duplicate row. |
| DI-004 | verified | Codex-first focused family 80/80 and complete App 1767/1767 prove packaged Windows eligibility and legacy fallback remain intact. |
| DI-005 | verified | Focused New Session/project discovery tests pass 20/20, Codex-first family passes 80/80, App typecheck and full suite pass. |
| DI-006 | verified | Focused App/CLI/Server transport and workspace tests, happy-wire 27/27, and final CLI 903/903 pass. |
| DI-007 | accepted gap | Schema-3 upgrade, workflow runtime 21/21, validators, strict audit, fresh candidate-bound structured run `6135f12d-e6b2-4273-9564-953438100f72`, and both independent review axes pass with the exact Server gap. Real-candidate staged and committed workflow CI are authorized terminal proof that cannot precede finish/archive. |
| DI-008 | verified | Full App/CLI/wire checks and native doctor/build pass. Fresh structured run `6135f12d-e6b2-4273-9564-953438100f72` binds only Server command index 3 to the unchanged two-fixture native-Windows gap. |
| DI-009 | verified | Diff/overlap/ignored-output checks, unsigned artifact inspection, fresh protected/generated/binary/high-signal-secret/unmerged scans, and both independent whole-diff review axes passed with no candidate finding. |
| DI-010 | accepted gap | Remote SHA equality, clean worktree, and PR #78 changing from `CONFLICTING` are necessarily post-archive/post-push delivery checks. The authorized normal push has not yet occurred and no remote success is claimed in the pre-archive evidence. |
| DI-011 | accepted gap | All focused RED -> GREEN tracers pass: pending merge lifecycle, inherited-evidence rejection, unreviewed novel-byte rejection, and Windows `core.autocrlf=false` LF portability. Adjacent regressions pass 5/5, the complete runtime passes 21/21, and fresh candidate-bound check plus dual-axis review evidence is recorded. Real-candidate staged and committed CI are authorized terminal proof that cannot precede finish/archive and commit. |

## Remaining gaps

- Pre-archive staged CI, finish/archive, archived staged CI, the normal
  two-parent merge commit, committed CI, non-force
  push, and final PR/hosted-check verification remain deliberately sequenced
  after this candidate-bound review.
- The exact two native-Windows Server POSIX `/tmp` fixture mismatches remain the
  sole candidate-bound check gap; they are unchanged on both parents and not a
  Codex-first integration regression.
- Standards identified non-blocking target-parent cleanup hardening for `.` and
  `..` review slugs. It requires a separate infrastructure scope; no Issue or
  code change was created here.
- T7's two review rounds found and TDD-closed the unreviewed novel-byte binding
  gap and the host-dependent ACTIVE newline comparison. The updated 21-test
  runtime, validator family, fresh structured check, and both final review axes
  pass; only terminal real-candidate staged/committed CI remains before and
  after archive/commit.
- Native macOS signing smoke is unavailable from this Windows host; no macOS
  result is inferred from the failed cross-host harness attempts.
