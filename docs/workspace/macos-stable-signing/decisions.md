# Decisions: `macos-stable-signing`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | Which signing class should local macOS refresh use? | decided | Prefer an explicitly configured eligible identity; automatic selection prefers Apple Development for least-privilege local builds, with Developer ID Application as a stable fallback. Never select iPhone Distribution or ad-hoc signing. `security find-identity -v -p codesigning` confirms a valid Apple Development identity exists on this host. |
| D2 | When should signing occur relative to installation? | decided | Sign and strictly verify the built `.app` before quitting, backing up, or replacing the installed app so signing failure leaves the working client untouched. |
| D3 | How should the stale credential be handled? | decided | After the stable code path and signed build artifact are verified, revalidate the exact service/account pair and delete only that recoverable GitHub Issues credential immediately before the first newly signed launch. This avoids letting the automatic launch access the old ACL-bound item. Require fresh GitHub authorization and do not modify other keychain entries. |

## Risk controls

- Blast radius: one local development app, one local code-signing identity, and
  one recoverable GitHub Issues credential; no production deployment or other
  users are affected.
- Precondition: an eligible identity must appear in the valid identities list;
  otherwise stop before quitting or replacing the installed client.
- Partial-failure control: sign and verify a build artifact first; the install
  path repeats signing verification before quitting and requires a successful
  existing-app backup before replacement. Delete the recoverable credential
  only after code/artifact verification and immediately before first launch.
- Least privilege: never read or print the credential value; identify and
  delete only the exact service/account pair after metadata revalidation.
- Rollback: restore the Happy Devtools application backup and reauthorize
  GitHub Issues. Credential loss is limited to a revocable OAuth session.
- Stop conditions: ambiguous identity selection, signing or strict validation
  failure, unexpected keychain metadata, dirty/diverged integration branches,
  or any request for a password/private key.
