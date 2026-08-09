# Context: `happy-ios-release`

`context.md` is the human-readable overview. The machine-readable, role-scoped
manifests are:

- `contexts/implement.jsonl`
- `contexts/check.jsonl`

Each JSONL entry contains a repository-relative `path` and a non-empty `reason`.
Keep each role limited to the files it actually needs.

## Implementation context

- Happy configuration: `packages/happy-app/app.config.js`,
  `packages/happy-app/eas.json`, and `packages/happy-app/package.json`.
- Operational implementation lives in sibling repository
  `/Users/myartings/workspace/happy-manager`.
- Reusable native release workflow lives in sibling repository
  `/Users/myartings/workspace/ios-coding-template`.
- See `contexts/implement.jsonl` for Happy-owned paths.

## Verification context

- See `contexts/check.jsonl`.

## Notes

- Do not run cloud builds, submissions, updates, or production OTA-server writes
  during implementation verification.
