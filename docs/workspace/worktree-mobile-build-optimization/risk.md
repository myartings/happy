# Risk Assessment: `worktree-mobile-build-optimization`

## Result

Cleared with controls. This change edits release orchestration but this task does
not execute a release. The highest consequence is a future false reuse decision
or an accidental/incorrect EAS action that consumes build capacity or publishes
the wrong personal update.

## Affected systems and blast radius

- One developer's personal Expo/EAS project and its iOS/Android artifacts.
- EAS build capacity, network bandwidth, personal internal distribution, and
  the personal OTA channel.
- Local external Happy Devtools reports. No application data, authentication
  tokens, server data, billing records, or store credentials are modified by
  this implementation.

## Failure modes

1. A planner false positive reuses a native-incompatible artifact.
2. A planner false negative recommends an unnecessary native build.
3. Dynamic Expo `extra` values continue to churn fingerprints, defeating reuse.
4. A dry-run accidentally authenticates, builds, publishes, hashes/downloads,
   or writes a report.
5. Android commands target the wrong profile, channel, package identity, or
   unsupported store-submission path.
6. JSON parsing loses a build ID/fingerprint or reports success after EAS fails.
7. Artifact hashing silently downloads a large IPA/APK.
8. Reports or temporary files enter tracked source or expose configuration
   secrets.
9. Refactoring shared helpers regresses existing iOS release guards.
10. A workflow prerequisite repair accidentally allows an unapproved, blocked,
    or stale check candidate to enter final review.

## Required controls

- Planner reuse requires exact platform, profile, channel, finished status, and
  native fingerprint; any unavailable evidence fails closed to
  `native-rebuild` with a reason.
- The Metro fast path uses a narrow allowlist and explicitly treats native
  assets/config/dependency inputs as sensitive.
- Fingerprint normalization uses Expo's supported skip for only the JavaScript
  `extra` section and is verified with controlled metadata changes on both
  platforms.
- Dry-runs return before EAS authentication/action/report code and have negative
  smoke coverage.
- Real actions retain clean-repository, `dev` branch, personal identity/profile,
  and EAS-authentication preconditions.
- Android Play submission is absent until separately specified and configured.
- Build commands use structured EAS JSON; failure writes a failed report and
  returns nonzero rather than claiming success.
- Full artifact SHA-256 requires the explicit `--hash-artifact` flag and is
  labeled as not computed otherwise.
- Reports and temporary JSON use the external Happy Devtools state directory or
  OS temporary storage; commands redact configured identity values.
- Existing iOS smoke tests plus new Android/planner/report tests must pass.
- Independent whole-diff review is required before finish.
- Final review accepts only `check=passed` or the explicit
  `check=accepted_gaps` disposition. Accepted gaps require a failed complete
  structured run, its run fingerprint, and exact staged-candidate identity;
  generic gates and all-passing runs cannot create the disposition. Staged
  package matching, both review axes, finish/archive guards, evidence/config
  freshness, and candidate integrity remain mandatory and are exercised through
  the public workflow CLI test suite.
- Structured results are canonical and exit-consistent: zero exit is only
  `passed` or provenance-valid `reused`; nonzero exit is only exact
  `failed (N)`. Relabeled zero-exit failures and failure records carrying reuse
  provenance are rejected at parsing, receipt, finish, and staged archive CI.

## Preconditions and stop conditions

- Stop before implementation if the accepted scope requires protected native
  directories, new credentials, Play submission, or a real EAS action.
- Stop a real action before network mutation unless the checkout is clean on
  the configured final branch and identity/profile checks pass.
- Stop and diagnose repeated parser/test failures rather than weakening
  fail-closed behavior.
- Do not compute an artifact hash without the explicit flag.

## Rollback

Before any authorized commit, rollback is removal of this task's bounded local
diff. No cloud or device rollback is needed because verification uses only
dry-runs, read-only lookups, local fingerprints, and fixtures. After a future
authorized commit, one Git revert restores the previous command surface.
