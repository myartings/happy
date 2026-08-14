# Review: `remote-workspace-project-discovery`

## Result

Passed after two correctness fixes. Re-review covered the full product diff,
accepted contracts, tests, validation evidence, privacy controls, compatibility,
concurrency, rollback, and forbidden surfaces.

No blocking finding remains.

## Findings

### R1 — Machine handler errors can be cached and rendered as `ready`

- Severity: medium
- Status: resolved
- Evidence:
  - `packages/happy-cli/src/api/rpc/RpcHandlerManager.ts:89` catches handler
    errors and encrypts an `{ error }` object as the RPC response.
  - `packages/happy-app/sources/utils/workspaceProjectDiscovery.ts:69` accepts
    any resolved value from the typed request, caches it, and returns `ready`
    without runtime validation.
- Impact: a root permission/scanner failure can resolve to `{ error: ... }`
  rather than reject. The picker then reports a ready empty state instead of the
  required non-blocking `unavailable` compatibility state, and caches the
  malformed response for 45 seconds.
- Required fix: validate the runtime response contract before caching/returning
  `ready`; malformed or encrypted error-shaped results must produce
  `unavailable`. Add a regression test for a resolved `{ error }` response.
- Resolution: `WorkspaceProjectDiscoveryLoader` now validates every project and
  top-level response field before caching or returning `ready`. A resolved
  `{ error }` response produces `unavailable` and is requested again rather than
  cached. Targeted regression test passes.

### R2 — Home-relative Recent paths do not deduplicate against absolute results

- Severity: medium
- Status: resolved
- Evidence:
  - `packages/happy-app/sources/utils/workspaceProjectDiscovery.ts:107` accepts
    `homeDir`, but the implementation never reads it.
  - `normalizePath` only trims separators/case and does not expand `~`.
- Impact: a Recent `~/workspace/happy` entry and discovered
  `/home/user/workspace/happy` or `C:\\Users\\user\\workspace\\happy` entry
  appear twice, violating Recent-wins normalized deduplication.
- Required fix: expand `~`/`~/...` using the selected Machine home directory
  before platform-specific comparison. Add Unix and Windows regression tests.
- Resolution: comparison now expands `~` using the selected Machine `homeDir`
  before platform-specific slash/case normalization. Unix and Windows
  regression cases pass.

## Confirmed boundaries

- No Server, database, Sync Engine, encryption, Machine/Session metadata,
  Session protocol, spawn shape, or Home Dock source file changed.
- Scanner uses bounded directory enumeration only; it does not read source
  contents, run shell/Git commands, follow symlinks, or log project results.
- Request generation rejects stale Machine responses; cache is Machine-keyed;
  RPC failures and timeouts already preserve Recent/manual input.
- Rollback remains removal of the optional handler and New Session integration,
  with no persisted data or migration.

## Remaining verification gaps

- The user accepted the unrelated Server attachment baseline failure.
- The user accepted deferring real daemon/App smoke to avoid restarting the
  daemon serving the active session.
