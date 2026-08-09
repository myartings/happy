# Context: `github-issues-device-flow`

## Problem

The personal GitHub Issues UI calls `/v1/github-issues/*` on the configured Happy
server. Installed Happy (dev) normally uses the official server, where those
personal routes do not exist, so Issue loading returns `404 Not Found`.

Operating a personal Happy server solely for this feature would add deployment,
availability, authentication, and upstream-merge work. The chosen migration
makes the feature a client-owned GitHub App Device Flow integration on installed
desktop/mobile clients.

## Scope

- Introduce a deep GitHub Issues client Module with Device Flow, token refresh,
  repository discovery, and the existing Issue operations.
- Store credentials in Expo SecureStore on mobile and the OS credential store on
  Tauri desktop.
- Keep browser builds unsupported and fail closed without a plaintext fallback.
- Keep the existing Issue product UI/navigation and default-off local flag.
- Remove the Issue server proxy and restore official GitHub profile behavior.
- Defer destructive schema cleanup until live client acceptance.

## Constraints

- GitHub App permissions remain Metadata read and Issues read/write on selected
  repositories.
- Only public client ID/app slug may ship; no client secret/private key.
- Official Happy GitHub profile authorization is independent and unchanged.
- Applied Prisma migrations are immutable.
- Tokens/device codes must not enter ordinary settings, Happy sync, logs, or
  browser localStorage.
- Most implementation must remain under the feature directory; host seams are
  limited to route/entry wiring, config, and Tauri command registration.

## Risk classification

High risk because the work changes authentication, authorization, GitHub
permissions, secure credential persistence, and a previously applied database
schema. Mitigations and evidence are specified in ADR 0006 and the feature spec.

Primary risks:

- token disclosure through transport, logging, or insecure fallback;
- rotated refresh-pair corruption;
- Device Flow polling abuse or phishing ambiguity;
- browser/Tauri runtime misclassification;
- accidentally coupling Issue disconnect to official profile disconnect;
- deleting server token columns before the replacement path is accepted;
- regressions while restoring the official connect flow.

## Evidence collected

- The app currently proxies Issue requests through `getServerUrl()` and Happy
  `AuthCredentials`.
- The server owns the Issue routes/service/runtime and optional token metadata.
- Expo SecureStore is already an app dependency; its existing auth wrapper uses
  localStorage on generic web, which is specifically unsuitable here.
- Tauri already registers the HTTP plugin but has no secure credential plugin.
- GitHub documents client-secret-free Device Flow and refresh for tokens
  originally generated through that flow.

## Implementation context

See `contexts/implement.jsonl` for the bounded source/design set.

## Verification context

See `contexts/check.jsonl` for contracts and evidence inputs used during review.
