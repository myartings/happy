# macOS Stable Signing Tasks

## Contract

The macOS personal Desktop refresh must sign `Happy (dev).app` with a stable,
valid local Apple code-signing identity before replacing the installed app. It
must never silently fall back to ad-hoc signing. The installed bundle must have
the expected identifier, a non-ad-hoc signature, a Team Identifier, and a valid
strict signature.

## Tasks

- [x] Add a focused regression smoke test for identity selection, stable
  signing, and refusal when no suitable identity exists.
- [x] Select an optional configured eligible identity, otherwise automatically
  prefer Apple Development with Developer ID Application as fallback.
- [x] Sign and verify the built app before quitting or replacing the installed
  app.
- [x] Extend installed-app verification to reject ad-hoc or teamless bundles.
- [x] Run focused, neighboring, and workflow checks. Staged CI runs after
  workflow archival, immediately before commit.

## Authorized operational follow-up

After this completed code slice is archived and integrated:

- Publish the devtools fix through the personal branch flow and rebuild from
  `dev`.
- Revalidate and remove only the stale `com.slopus.happy.dev` /
  `github-issues-device-flow-v1` credential before the first launch of the
  newly signed client.
- Replace and verify the installed client, launch it, and complete fresh GitHub
  authorization when the feature is next used.

## Done when

The tooling selects an eligible stable identity, signs and strictly verifies
the build before replacement, fails closed without a valid identity or backup,
and rejects an ad-hoc/teamless installed client. The authorized operational
follow-up then proves the installed result and clears the stale ACL-bound item.
