# Finish Review: `personal-ota-actions-fix`

## Summary

The personal Android OTA workflow can now run from a purpose-built tag on a
reviewed `dev` commit, while `main` stays aligned with upstream. Android releases
validate their native fingerprint explicitly and avoid a second automatic scan
during publication.

## Verification

- Workflow structure, repository guards, Expo configuration, fingerprinting,
  typechecks, and repository workflow checks passed.
- The two full-suite gaps are unrelated Windows baseline behavior and are
  documented in `validation.md`.

## Whole-diff review

- Tag namespace is Android-only and deployment remains serialized.
- Tags outside `origin/dev` fail before dependency installation or publication.
- iOS/all manual behavior remains unchanged.
- No credentials, native projects, runtime versions, or EAS channels changed.

## Rollback or mitigation

Remove the tag trigger, release guard, fingerprint preflight, and scoped skip
flag from `.github/workflows/personal-ota.yml`. Existing installed builds and
previous EAS updates are unaffected by the workflow-only rollback.

## Lessons promoted

- `CONTEXT.md`: no global product lesson required.
- `docs/ARCHITECTURE.md` or ADR: none; personal deployment automation only.
- Skill/workflow rule: none; the operational constraint is captured in the
  feature spec and workflow evidence.

## Follow-up

- After merge into `dev`, push one unique `personal-ota/android/*` tag and watch
  the first GitHub-hosted run before using the flow for later releases.
