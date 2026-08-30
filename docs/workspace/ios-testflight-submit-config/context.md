# Context: `ios-testflight-submit-config`

`context.md` is the human-readable overview. The machine-readable, role-scoped
manifests are:

- `contexts/implement.jsonl`
- `contexts/check.jsonl`

Each JSONL entry contains a repository-relative `path` and a non-empty `reason`.
Keep each role limited to the files it actually needs.

## Implementation context

- See `contexts/implement.jsonl`.

## Verification context

- See `contexts/check.jsonl`.

## Notes

- First live TestFlight submission showed that EAS expands ASC API-key fields
  but does not expand `ascAppId` or `appleTeamId` in submit profiles.
- The fix pins the non-secret personal App Store Connect app/team identifiers
  while keeping private-key material in the untracked local configuration.
- Release target is EAS build `796d2451-defb-4ecb-80e0-90040af8fa10`
  (`1.7.0 (10)`).
