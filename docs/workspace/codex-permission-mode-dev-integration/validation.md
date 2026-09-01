# Validation: `codex-permission-mode-dev-integration`

| Date | Command / signal | Result | Notes |
| --- | --- | --- | --- |
| `2026-09-01` | Parent/Issue/PR inspection | passed | Fixed ours `5f8585f8`, theirs `633c5b94`; #87 and #88 remain separate accepted behavior contracts. |
| `2026-09-01` | Conflict and final-delta inspection | passed | Only archive conflicted mechanically; final delta versus `origin/dev` remains Issue #87 plus local integration evidence. |
| `2026-09-01` | App resolver/message/live-picker integration tests | passed | 43/43. |
| `2026-09-01` | CLI metadata/live-controller/permission/remote-state tests | passed | 41/41. |
| `2026-09-01` | Happy App and CLI typechecks | passed | Combined auto-merge and single metadata declaration typecheck. |
| `2026-09-01` | merge-mode staged CI before local workflow | expected block | Correctly required one checked and reviewed merge-local workflow for novel non-lifecycle bytes. |

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| MI1-MI2 merge identity and lifecycle union | verified | Git/parent/archive inspection; final two-parent commit proof is sequenced after archive |
| MI3-MI4 App/CLI combined behavior | verified | Focused App 43/43 and CLI 41/41 |
| MI5 single metadata declaration | verified | Source inspection and typechecks |
| MI6 excluded scope unchanged | verified | Whole-diff inspection and both capable reviewers found no out-of-scope behavior |
| MI7 configured checks | accepted gap | Run `206bd05a-d7f5-4ebf-a8ad-e8a8eb5b8f7a`: 7/9 passed; exact command indexes 2 and 3 accepted |
| MI8 independent review | verified | Capable Spec and Standards reviews accepted frozen candidate `c9c19cb...e1f25` with no findings |
| MI9 archive/commit/push/PR state | verified | Pre-archive readiness complete; archive, merge commit, committed CI, push, and PR-state proof are intentionally sequenced next |

## Remaining gaps

- App command index 2 failed one untouched Studio sidebar string-wiring
  assertion; 1925 other App tests passed.
- Server command index 3 failed two untouched native-Windows local-storage
  fixtures; 110 other Server tests passed.
- The three failing test blobs are identical in the feature parent,
  `MERGE_HEAD`, `origin/dev`, index, and worktree. The user explicitly accepted
  this exact gap family earlier; the fresh run receipt binds only indexes 2 and
  3. No new integration gap is accepted.

## Automated check evidence

<!-- WORKFLOW_CHECKS_START -->
| Date | Profile / group | Command | Result | Exit code | Revision / working tree | Duration |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-09-01T12:46:18+00:00 | full / typecheck | `pnpm --filter happy-app typecheck` | passed | 0 | 5f8585f8d9d5; working tree `fc18ebc27a15` | 14172 ms |
| 2026-09-01T12:46:27+00:00 | full / typecheck | `pnpm --filter happy-server typecheck` | passed | 0 | 5f8585f8d9d5; working tree `1b1e1eed0260` | 8078 ms |
| 2026-09-01T12:46:48+00:00 | full / test | `pnpm --filter happy-app exec vitest run` | failed (1) | 1 | 5f8585f8d9d5; working tree `8b25e3a9d021` | 19859 ms |
| 2026-09-01T12:47:00+00:00 | full / test | `pnpm --filter happy-server test` | failed (1) | 1 | 5f8585f8d9d5; working tree `6e11e29dfdf1` | 11594 ms |
| 2026-09-01T12:47:01+00:00 | full / check | `{python} scripts/test-happy-workflow-state-upgrade.py` | passed | 0 | 5f8585f8d9d5; working tree `303ebeb1d209` | 172 ms |
| 2026-09-01T13:00:38+00:00 | full / check | `{python} scripts/test-happy-workflow-runtime.py` | passed | 0 | 5f8585f8d9d5; working tree `d87e6388b82f` | 815344 ms |
| 2026-09-01T13:00:39+00:00 | full / check | `{python} scripts/validate-happy-workflow.py` | passed | 0 | 5f8585f8d9d5; working tree `a69ab7222944` | 157 ms |
| 2026-09-01T13:00:40+00:00 | full / check | `{python} scripts/test-validate-happy-workflow.py` | passed | 0 | 5f8585f8d9d5; working tree `76621f3635ce` | 360 ms |
| 2026-09-01T13:00:41+00:00 | full / check | `{python} scripts/workflow-audit.py --all --strict` | passed | 0 | 5f8585f8d9d5; working tree `b1b591cf43f8` | 250 ms |
<!-- WORKFLOW_CHECKS_END -->
