# Validation: `happy-desktop-official-release`

Record exact commands and results. Never mark a check passed unless it ran.
Use `unavailable` when the configured tool is not installed or cannot execute,
and state the consequence under Remaining gaps; unavailable is not a pass.

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| `2026-08-21` | `bash -n devtools/happyctl` | passed | Bash syntax valid. |
| `2026-08-21` | `bash devtools/tests/happyctl-official-baseline-smoke.sh` | passed | Profile, allowlist, detached worktree, dirty/divergent guards, caller branch preservation, dry-run, and rollback routing covered. |
| `2026-08-21` | `bash devtools/tests/happyctl-macos-signing-smoke.sh` | passed | Stable signing and install ordering remain valid. |
| `2026-08-21` | `bash devtools/tests/happyctl-refresh-guards-smoke.sh` | passed | Existing source and personal-build guards remain valid. |
| `2026-08-21` | `shellcheck devtools/happyctl devtools/tests/happyctl-official-baseline-smoke.sh` | passed | No diagnostics. |
| `2026-08-21` | `quick_validate.py .agents/skills/happy-desktop-official-release` | passed | Skill structure and metadata valid. |
| `2026-08-21` | `devtools/happyctl refresh-official-baseline --dry-run` | passed | Printed canonical source/worktree/identity/install targets and made no changes. |
| `2026-08-21` | `validate-happy-workflow.py`; workflow core/CI tests; strict audit | passed | Repository workflow checks passed; audit had only then-pending lifecycle gates. |
| `2026-08-21` | PowerShell parse of `devtools/happyctl.ps1` | passed | Cross-platform allowlist edit parses. |
| `2026-08-21` | `git diff --check` | passed | No whitespace errors. |
| `2026-08-21` | `devtools-layout-smoke.sh` on feature branch | not applicable | The test intentionally requires an official-equivalent `HEAD`; this feature worktree is based on product-bearing `dev`. Run after promoting the allowlisted infrastructure subset to `main`. |

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| Source guards and no branch switching | verified | official-baseline smoke fixture plus read-only validation of real `main` against `upstream/main` |
| Separate app identity/install path | verified | profile assertions and dry-run output |
| Stable signing and backup ordering | verified | macOS signing smoke test |
| Skill routing and manager ownership | verified | Skill validator and documentation inspection |
| Full build/install/launch | accepted gap | User authorized local integration after the pre-existing dirty runtime baseline worktree and deferred real refresh were explicitly reported. |

## Remaining gaps

- The existing `.baseline/worktree/official-main` contains pre-existing generated
  icon/config/lockfile changes. The new command correctly refuses to discard
  them; they must be reviewed or replaced before the first real refresh.
- Full build/install/launch remains an integration check after the allowlisted
  implementation is committed/promoted to `main`.
