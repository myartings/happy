# Decisions: `github-issues-device-flow`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | Where does Issue authentication and API traffic live? | resolved | Installed clients use GitHub App Device Flow and call GitHub directly; ADR 0006. |
| D2 | Does this replace Happy's official GitHub profile connection? | resolved | No. Issue credentials have an independent lifecycle and storage namespace. |
| D3 | Which platforms are supported? | resolved | iOS, Android, and Tauri desktop; generic browser is unsupported in v1. |
| D4 | Where are tokens stored? | resolved | Expo SecureStore on mobile and OS credential storage via a narrow Tauri Adapter; no browser/plaintext fallback. |
| D5 | What GitHub authority is shipped? | resolved | Public App client ID/slug only; Metadata read plus Issues read/write; no secret/private key. |
| D6 | How is refresh handled? | resolved | Expiring user tokens, five-minute pre-refresh, single-flight, and atomic pair rotation without client secret. |
| D7 | How are repositories discovered? | resolved | User-token-accessible App installations and their selected repositories; installation link when empty. |
| D8 | How are old server routes retired? | resolved | Cut client over, remove routes/service/flag and restore profile flow; keep historical migration. |
| D9 | When are obsolete database columns removed? | resolved | Only after live client acceptance, using a new forward migration in a separate cleanup commit. |
| D10 | Is there a server fallback? | resolved | No. Unsupported/misconfigured clients fail explicitly to avoid split credential ownership. |
