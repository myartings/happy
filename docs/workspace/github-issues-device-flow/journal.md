# Journal: `github-issues-device-flow`

## `2026-08-09`

- Started workflow.
- Confirmed the failure boundary: the client calls personal Issue routes on an
  official Happy server that does not provide them.
- Reviewed existing Issue UI/server code, Expo SecureStore usage, Tauri HTTP
  capability, Prisma token metadata, and official GitHub Device Flow/refresh
  documentation.
- Chose a deep client Module with secure-storage and transport Adapters, no web
  credential Adapter, and no dependency on the official GitHub profile token.
- Added ADR 0006, migration specification, and implementation task slices.
- Staged server retirement before a separate post-acceptance schema cleanup.
