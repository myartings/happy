# Decisions: `ios-testflight-submit-config`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | How should EAS receive the App Store app/team identifiers? | accepted | Pin the non-secret personal values `6806555472` and `MJS6V7A44A` in `submit.personal-store`; EAS 21.7 does not evaluate environment variables for these fields. |
| D2 | Where do submission credentials live? | accepted | Keep API key path, key ID, and issuer ID environment-expanded from untracked Happy Devtools config; never track the private key. |
| D3 | Which binary may be submitted? | accepted | Only explicit EAS build ID `796d2451-defb-4ecb-80e0-90040af8fa10`, produced by `personal-store` for `com.myartings.happy`. |
| D4 | What controls production-release risk? | accepted | Clean `dev`, personal identity validation, dedicated APP_MANAGER key, exact build selection, dry-run first, staged workflow CI, and post-submit verification. |
