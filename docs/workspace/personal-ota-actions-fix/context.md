# Context: `personal-ota-actions-fix`

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

- GitHub only exposes `workflow_dispatch` when the workflow exists on the
  default branch. This repository intentionally keeps `main` aligned with
  `upstream/main`, while personal release automation lives on `dev`.
- A push of a matching tag can execute the workflow definition from the tagged
  commit, so Android OTA releases can remain personal without changing `main`.
- The first Windows OTA publish failed while automatic fingerprinting scanned
  an unrelated iOS project file. Android-only fingerprint generation succeeds,
  and the same update published successfully when the subsequent publish skipped
  the redundant all-platform fingerprint pass.
