# Finish Review: `github-issues-device-flow`

## Summary

- Replaced the personal Happy server Issue proxy with a default-off,
  client-owned GitHub App Device Flow integration.
- Added OS-backed desktop credentials, mobile SecureStore support, direct
  GitHub repository/Issue CRUD, and navigation-independent authorization.
- Retired the personal server routes while restoring the official GitHub
  profile flow to `upstream/main` behavior.
- Fixed live Windows defects in Tauri HTTP compatibility, authorization
  lifecycle, external links, list layout, and detail action visibility.

## Verification

- Windows Device Flow, repository discovery, credential persistence across
  rebuild/restart, list/detail, create, close, reopen, and permanent delete
  passed live against `myartings/happy`.
- Full happy-app suite passed: 100 files and 1013 tests.
- App and server typechecks passed; targeted Issue suites passed 26/26.
- Windows Tauri release build, NSIS install, hash comparison, and launch smoke
  passed for the accepted build.
- Workflow validator, core tests, CI tests, and strict audit passed with the
  documented live-platform gaps.
- Full happy-server suite passed 94/95; the unrelated local attachment GET test
  still returns 404 and reproduces when run alone.

## Whole-diff review

- No blocking Issue-feature correctness or credential-boundary finding remains.
- Tokens are stored only in Expo SecureStore or the app-scoped OS credential
  store. Browser builds fail closed, and no plaintext fallback exists.
- Authorization headers are constructed inside the GitHub transport and can be
  sent only to exact trusted HTTPS hosts.
- Feature navigation remains default off and isolated from Project Todos and
  the official Happy GitHub profile.
- Gaps accepted for this Windows slice: no real iOS/Android run, no live
  Issue-only disconnect/profile-isolation cycle, and no dedicated automated
  official-profile reconnect regression test.

## Rollback or mitigation

- Turn off `devGithubIssuesEnabled` to remove normal navigation and prevent
  Device Flow/storage activity.
- Reverting the feature commit restores the former client/server design; the
  official GitHub profile remains independent.
- Do not drop historical Issue credential columns yet. A forward schema cleanup
  remains deferred until the replacement has completed its acceptance interval.

## Lessons promoted

- `CONTEXT.md`: feature context records the client/server and credential
  ownership boundary.
- `docs/ARCHITECTURE.md` or ADR: ADR 0006 records Device Flow, secure storage,
  direct transport, isolation, retirement, and rollback decisions.
- Skill/workflow rule: no new general rule; the existing high-risk gates and
  live evidence log caught transport and UI defects before commit.

## Follow-up

- Run the authorization/storage/CRUD smoke on at least one iOS or Android device.
- Exercise `Remove from this device`, reconnect, and confirm the official Happy
  GitHub profile is unchanged; add a dedicated server regression test.
- Add the remaining Adapter/error fixtures, translations, and accessibility
  labels from the task document.
- After an acceptance interval, add a forward migration removing only obsolete
  Issue credential columns; never rewrite the historical migration.
