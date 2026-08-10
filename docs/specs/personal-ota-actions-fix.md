# Personal OTA Actions Fix

## Problem

The personal OTA workflow is intentionally stored on `dev`, not the upstream-
aligned default `main` branch. GitHub therefore does not register its
`workflow_dispatch` trigger. The first local Android publish also exposed a
transient failure when EAS automatic fingerprinting inspected iOS native files.

## Acceptance criteria

1. Pushing a tag matching `personal-ota/android/*` runs the workflow definition
   from the tagged `dev` commit without modifying `main`.
2. A tag whose commit is not contained in `origin/dev` fails before dependency
   installation or any EAS publication.
3. Tag-triggered runs always publish Android to the existing `personal` EAS
   channel and produce a useful default update message.
4. Android runs generate an Android-only native fingerprint before publishing,
   then skip only the redundant automatic fingerprint pass during `eas update`.
5. Manual dispatch inputs continue to support `android`, `ios`, and `all` if the
   workflow is later made available on the default branch.
6. Credentials, Expo configuration validation, typechecking, and concurrency
   protections remain intact.

## Release operation

Create a unique tag on the desired `dev` commit and push only that tag. The
workflow checks that the commit belongs to `origin/dev` before it can publish.
Tags are immutable release records and should not be reused.
