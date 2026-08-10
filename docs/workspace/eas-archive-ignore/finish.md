# Finish Review: `eas-archive-ignore`

## Summary

Added a conservative repository-root `.easignore` for Expo EAS builds. It
removes local worktrees, Git metadata, desktop-only Tauri files, and generated
CLI outputs while retaining all inputs required by the root pnpm install.

## Verification

EAS archive inspection produced a 138 MB unpacked archive, down from 2.1 GB.
A clean frozen workspace install, CLI postinstall, Happy Wire build, Happy App
typecheck, workflow validator, workflow test suites, and strict audit passed.

## Whole-diff review

The product change is limited to `.easignore`; remaining files are workflow
scope and verification evidence. No application runtime, native iOS, EAS
profile, dependency, credential, or release behavior changed.

## Rollback or mitigation

Delete `.easignore` to restore EAS's prior `.gitignore`-based archive behavior.
If future workspace scripts require another ignored input, remove only that
specific exclusion and verify again with `eas build:inspect` plus a clean
archive install.

## Lessons promoted

- No shared architecture or workflow rule is needed. The package-specific
  requirement that Happy CLI archives remain is documented in `.easignore` and
  this workflow's decision log.

## Follow-up

Commit the branch and open a pull request targeting personal `dev` when the
user authorizes publication.
