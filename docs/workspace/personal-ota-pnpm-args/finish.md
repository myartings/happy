# Finish Review: `personal-ota-pnpm-args`

## Summary

The Android OTA workflow now forwards EAS options directly instead of inserting
a standalone `--` that EAS CLI rejects.

## Verification

Exact EAS help-mode parsing, YAML assertions, App typecheck, repository workflow
tests/audit, and whitespace checks pass. Hosted failure evidence is recorded.

## Whole-diff review

The product diff removes one token from the workflow. Tag, SHA guard, identity,
fingerprint, channel, environment, platform, message, and non-interactive
behavior remain unchanged.

## Rollback or mitigation

Restore the separator to reproduce the parsing failure. No installed build or
previous update is changed by this workflow-only patch.

## Lessons promoted

- `CONTEXT.md`: no global product rule needed.
- `docs/ARCHITECTURE.md` or ADR: none; CLI invocation syntax only.
- Skill/workflow rule: preserve hosted failure evidence and validate wrapper
  argument forwarding at the executable boundary.

## Follow-up

- Merge the repair PR, push a new unique Android OTA tag, and monitor publication.
