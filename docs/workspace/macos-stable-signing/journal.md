# Journal: `macos-stable-signing`

## `2026-08-12`

- Started workflow.
- Diagnosed the prompt as an ACL mismatch caused by `happyctl` forcibly
  applying a changing ad-hoc signature after every install.
- Confirmed a valid Apple Development code-signing identity is available.
- Owner authorized the stable-signing repair, rebuild, installation, targeted
  stale-credential removal, and launch.
- Added RED/GREEN smoke coverage and implemented stable identity selection,
  sign-before-replace ordering, strict signature verification, and explicit
  refusal of ad-hoc/teamless apps.
- Signed the existing generated build with the real local Apple Development
  identity and verified its Apple chain, Team Identifier, hardened runtime,
  bundle identifier, and entitlements without replacing the installed app.
