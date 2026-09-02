# Validation: `workflow-template-2026-09-2-adoption`

Record exact commands and results. Never mark a check passed unless it ran.
Use `unavailable` when the configured tool is not installed or cannot execute,
and state the consequence under Remaining gaps; unavailable is not a pass.

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| `2026-09-02` | live Issue #104 and Project #16 read-only inspection | passed | Open `enhancement + ready-for-agent`; exact prepared locator and `In Progress / Happy Codex Root / MacBook Air myartings` match. |
| `2026-09-02` | current branch/worktree/base/status inspection | passed | Exact registered Issue worktree; branch based on `origin/dev@1e03026a5febe5815a47687c7b220aa6c6dba758`; only preparation/local-contract files are dirty. |
| `2026-09-02` | runtime request metadata | passed | Current session reports `gpt-5.6-sol`, `medium`, and the exact Issue workspace root. |
| `2026-09-02` | predecessor `.1` Workspace inspection | passed | Preserved, active only in its separate worktree, planning/decisions blocked because Happy is absent from `.1` cohorts; superseded for delivery by Issue #104. |
| `2026-09-02` | source status, HEAD, dereferenced tag | passed | Clean `.2` source checkout; HEAD and `workflow-2026.09.2^{}` equal `40dc17d0d200370fd8c5498fb1da1bdd9ebde4e9`. |
| `2026-09-02` | `workflow-release.py plan --release workflow-2026.09.2 --workspace-root /Users/myartings/workspace` | passed | Schema 2; Canary order is `html-artifact-app`, then `happy`; rollout set empty. |
| `2026-09-02` | pinned-source selective dry-run after `.2` provenance update | passed | Exactly 23 changes: 22 canonical updates plus one `.ai/project.json` merge; three retirements already absent; no blocked or forbidden surface. |
| `2026-09-02` | pinned-source selective `--apply` | passed | Transactional manifest-scoped apply completed; no product, dependency, native, CI, devtools, release, or generated path changed. |
| `2026-09-02` | initial `test-happy-workflow-runtime.py` after canonical apply | diagnostic failure | 33 failures and one error exposed a systematic translation mismatch: canonical runtime callers crossed Happy's preserved check API and overwrote accepted-gap/replan/fork-aware/merge-integration behavior. |
| `2026-09-02` | `.08.2`-based three-way translation and focused red loops | passed | Restored Happy invariants while adding `.2` formal binding, same-candidate review, manual-launch, shadow-selection, and cross-platform config fingerprint behavior; fork route 2/2, accepted-gap, review, and merge regressions passed. |
| `2026-09-02` | final pinned-source selective dry-run | passed | Zero changes; canonical allowlist is exact and the five coupled Happy translation scripts are preserved by the manifest. |
| `2026-09-02` | `python3 scripts/validate-happy-workflow.py` | passed | Immutable `.2` provenance and translated preserve/include boundary valid. |
| `2026-09-02` | `python3 scripts/test-validate-happy-workflow.py` | passed | 9/9 validator tests. |
| `2026-09-02` | `python3 scripts/test-happy-workflow-state-upgrade.py` | passed | 2/2 active-state compatibility tests. |
| `2026-09-02` | `python3 scripts/test-happy-workflow-runtime.py` | passed | Final 40/40 in 356.259s, including passed/accepted-gap post-review rechecks, pre-recording drift rejection, failed-recheck invalidation, replan, fork remote, merge integration, archive, and CRLF/LF coverage. |
| `2026-09-02` | `python3 scripts/workflow-audit.py --all --strict` | passed | Repository workflows valid with the current active `.2` adoption Workspace. |

## Automated check evidence

<!-- WORKFLOW_CHECKS_START -->
| Date | Profile / group | Command | Result | Exit code | Revision / working tree | Duration |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-09-02T13:02:05+00:00 | docs+workflow / docs-check | `{python} scripts/validate-happy-workflow.py` | passed | 0 | 1e03026a5feb; working tree `e9f3f3f9f66f` | 41 ms |
| 2026-09-02T13:02:05+00:00 | docs+workflow / docs-check | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | 1e03026a5feb; working tree `dcb01f3cf0c5` | 128 ms |
| 2026-09-02T13:02:06+00:00 | docs+workflow / workflow-targeted | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | 1e03026a5feb; working tree `3b702a9fee24` | 64 ms |
| 2026-09-02T13:07:28+00:00 | docs+workflow / workflow-targeted | `{python} scripts/test-happy-workflow-runtime.py` | passed | 0 | 1e03026a5feb; working tree `1ad2d1bda314` | 321653 ms |
| 2026-09-02T13:07:28+00:00 | docs+workflow / workflow-targeted | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | 1e03026a5feb; working tree `298dd2536e75` | 126 ms |
| 2026-09-02T13:25:52+00:00 | docs+workflow / docs-check | `{python} scripts/validate-happy-workflow.py` | passed | 0 | 1e03026a5feb; working tree `37b667cfef1d` | 45 ms |
| 2026-09-02T13:25:52+00:00 | docs+workflow / docs-check | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | 1e03026a5feb; working tree `58c7bbc9b108` | 110 ms |
| 2026-09-02T13:25:53+00:00 | docs+workflow / workflow-targeted | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | 1e03026a5feb; working tree `3493ed638eda` | 83 ms |
| 2026-09-02T13:31:29+00:00 | docs+workflow / workflow-targeted | `{python} scripts/test-happy-workflow-runtime.py` | passed | 0 | 1e03026a5feb; working tree `56e6074c1db9` | 335401 ms |
| 2026-09-02T13:31:29+00:00 | docs+workflow / workflow-targeted | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | 1e03026a5feb; working tree `5dc67d7ae6c1` | 77 ms |
| 2026-09-02T13:37:08+00:00 | docs+workflow / docs-check | `{python} scripts/validate-happy-workflow.py` | passed | 0 | 1e03026a5feb; working tree `16cdef01873c` | 28 ms |
| 2026-09-02T13:37:08+00:00 | docs+workflow / docs-check | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | 1e03026a5feb; working tree `5da1ec5c573c` | 76 ms |
| 2026-09-02T13:37:08+00:00 | docs+workflow / workflow-targeted | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | 1e03026a5feb; working tree `008aa12e6550` | 43 ms |
| 2026-09-02T13:43:04+00:00 | docs+workflow / workflow-targeted | `{python} scripts/test-happy-workflow-runtime.py` | passed | 0 | 1e03026a5feb; working tree `ccd2444bd3c2` | 356307 ms |
| 2026-09-02T13:43:05+00:00 | docs+workflow / workflow-targeted | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | 1e03026a5feb; working tree `943e965e56c0` | 82 ms |
| 2026-09-02T13:48:07+00:00 | docs+workflow / docs-check | `{python} scripts/validate-happy-workflow.py` | passed | 0 | 1e03026a5feb; working tree `104ef849696e` | 42 ms |
| 2026-09-02T13:48:08+00:00 | docs+workflow / docs-check | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | 1e03026a5feb; working tree `8564658906ac` | 102 ms |
| 2026-09-02T13:48:08+00:00 | docs+workflow / workflow-targeted | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | 1e03026a5feb; working tree `7bff6edf8f04` | 75 ms |
| 2026-09-02T13:54:40+00:00 | docs+workflow / workflow-targeted | `{python} scripts/test-happy-workflow-runtime.py` | passed | 0 | 1e03026a5feb; working tree `cd0b8c9d3b4d` | 391219 ms |
| 2026-09-02T13:54:40+00:00 | docs+workflow / workflow-targeted | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | 1e03026a5feb; working tree `9f2302568c97` | 111 ms |
| 2026-09-02T13:58:25+00:00 | docs+workflow / docs-check | `{python} scripts/validate-happy-workflow.py` | passed | 0 | 1e03026a5feb; working tree `07aa13d94ea5` | 47 ms |
| 2026-09-02T13:58:26+00:00 | docs+workflow / docs-check | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | 1e03026a5feb; working tree `14168782c98d` | 101 ms |
| 2026-09-02T13:58:26+00:00 | docs+workflow / workflow-targeted | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | 1e03026a5feb; working tree `7557934b5daf` | 64 ms |
| 2026-09-02T14:03:47+00:00 | docs+workflow / workflow-targeted | `{python} scripts/test-happy-workflow-runtime.py` | passed | 0 | 1e03026a5feb; working tree `acfd384cdb76` | 320955 ms |
| 2026-09-02T14:03:48+00:00 | docs+workflow / workflow-targeted | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | 1e03026a5feb; working tree `50cc87d88f6a` | 122 ms |
<!-- WORKFLOW_CHECKS_END -->

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| AC1 source and cohort identity | verified | exact Git and release-plan evidence above |
| AC2-AC6 selective classification/apply/zero drift | verified | 23-change classification, transactional apply, translated preservation boundary, and zero-drift final dry-run |
| AC7 configured checks | verified | final staged applicable run executed all five configured commands with zero failures; runtime 40/40, validator 9/9, upgrader 2/2, and strict all-workspace audit passed |
| AC8 independent review | verified | satisfied only by the candidate-bound `finalReview` outcomes and `review=passed` receipt recorded in `workflow.json` after both capable axes accept this unchanged terminal candidate; this static row carries no prior candidate identity |
| AC9 excluded-path preservation | verified | changed-path inventory contains only workflow/config/local-contract surfaces; excluded product/protected paths absent |

## Remaining gaps

- No acceptance gap remains. Finish/archive projection and staged CI are the
  remaining lifecycle operations; commit, push, PR, merge, Issue mutation, and
  cleanup remain outside the authorized boundary.
