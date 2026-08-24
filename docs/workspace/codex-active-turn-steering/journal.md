# Journal: `codex-active-turn-steering`

## 2026-08-24 — Planning and scope

- User accepted native active-turn steering and requested a dev client release.
- Classified as Feature intensity because it changes Codex session scheduling.
- Risk is bounded to message loss, duplication, or misrouting. Controls are the
  protocol's expected-turn precondition, exactly-once queue fallback, focused
  race tests, existing queue preservation, and rollback by removing the host seam.
- GitHub delivery boundary is a feature PR targeting `dev`; no separate Issue is
  needed for this immediate single-owner change.

## 2026-08-24 — Implementation

- Added a typed `turn/steer` client request with an explicit expected-turn
  override so image preparation cannot redirect input into a replacement turn.
- Added a focused router that steers ordinary active input and falls back to the
  existing queue exactly once on every request rejection.
- Preserved `/clear`, idle input, and `/goal` host-control behavior.
- Targeted typecheck and all Codex unit tests pass.

## `2026-08-24`

- Started workflow.
