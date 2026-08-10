# Validation: `eas-archive-ignore`

Record exact commands and results. Never mark a check passed unless it ran.
Use `unavailable` when the configured tool is not installed or cannot execute,
and state the consequence under Remaining gaps; unavailable is not a pass.

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| `2026-08-10` | `eas build:inspect --platform ios --profile personal --stage archive` | passed | Final archive is 138 MB unpacked instead of the prior 2.1 GB local inspection; `.git`, `.baseline`, `.dev`, `src-tauri`, and pre-unpacked CLI tools are absent. |
| `2026-08-10` | Required-input presence checks against the inspected archive | passed | Root pnpm metadata, patches, Expo config, app sources, Happy Wire, and CLI tool archives are present. |
| `2026-08-10` | `SKIP_HAPPY_WIRE_BUILD=1 pnpm install --frozen-lockfile` inside the inspected archive | passed | All nine workspaces installed; root/app/server/CLI postinstall scripts completed, including platform CLI tool unpacking. |
| `2026-08-10` | `pnpm --filter @slopus/happy-wire build && pnpm --filter happy-app typecheck` inside the inspected archive | passed | Required workspace dependency built and app TypeScript check passed from upload contents. |
| `2026-08-10` | `pnpm --filter happy-app typecheck` in the source worktree | passed | App TypeScript check passed. |
| `2026-08-10` | `validate-happy-workflow.py`, workflow core/CI tests, and strict active audit | passed | Workflow validator and both 14-test suites passed; audit reported only expected future gates before finish. |

## Acceptance coverage

| Criterion | Status | Evidence |
| --- | --- | --- |
| Exclude local/VCS/desktop/generated inputs | verified | Exact absence checks against EAS archive output. |
| Preserve all cloud-install inputs | verified | Presence checks plus clean frozen workspace install. |
| Materially reduce the archive | verified | 2.1 GB to 138 MB unpacked, about a 93% reduction. |
| Preserve source validity | verified | Happy Wire build and Happy App typecheck passed from the archive. |

## Remaining gaps

- No functional gap. A future cloud build will confirm the exact compressed
  upload size, but another build is intentionally not consumed solely for this
  optimization.
