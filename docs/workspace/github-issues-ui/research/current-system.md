# Current-system evidence

## Happy codebase

- `packages/happy-app/sources/sync/apiGithub.ts`: profile connection and
  disconnect only; no repository or Issue APIs.
- `packages/happy-server/sources/app/api/routes/connectRoutes.ts`: current OAuth
  scopes are `read:user,user:email,read:org,codespace`.
- `packages/happy-server/sources/app/github/githubConnect.ts`: encrypted token
  persistence and profile/avatar synchronization.
- `packages/happy-server/sources/modules/github.ts`: GitHub App and Issue webhook
  registration exists, but handlers only log events.
- `packages/happy-app/sources/components/MainView.tsx`: native home remains a
  session surface; web owns the existing tab switcher.
- `packages/happy-app/sources/components/SidebarView.tsx`: persistent desktop and
  tablet seam suitable for a guarded Issues entry.
- `packages/happy-app/sources/-session/SessionView.tsx`: phone chat header has a
  small right-slot seam and must not be structurally replaced.
- `packages/happy-app/sources/app/(app)/project-todos.tsx`: useful interaction
  reference for project selection, not a GitHub data model.

## GitHub platform

- GitHub Apps support repository selection and fine-grained Issues read/write
  without repository Contents access.
- Classic OAuth requires `public_repo` or broad `repo` for Issue operations.
- Permanent deletion uses GraphQL `deleteIssue`, is limited to eligible
  owners/admins, and exposes `viewerCanDelete` as the capability signal.
