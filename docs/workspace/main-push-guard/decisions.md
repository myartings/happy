# Decisions: `main-push-guard`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | What is the enforcement boundary? | decided | A tracked local pre-push hook prevents accidental updates; deliberate `--no-verify` bypass remains a documented non-goal. |
| D2 | Which main updates remain valid? | decided | Only local `main`, invoked by `happyctl`, containing the configured upstream commit and differing only in the existing allowlist. |
| D3 | How is the hook activated per clone? | decided | An idempotent `happyctl install-git-guards` command copies the tracked hook into the Git common directory and points clone-local `core.hooksPath` there, so switching branches cannot disable it; doctor fails with a repair instruction on drift. |

## Risk assessment

Result: `cleared-with-controls`.

- False rejection could interrupt a legitimate refresh. Control: exercise the
  real push seam and scope the authorization marker to `happyctl`'s main push.
- False acceptance could contaminate personal `main`. Control: require the
  source ref, upstream ancestry, and existing path allowlist independently.
- Hook absence on another clone could remove protection. Control: explicit
  installation plus fail-closed doctor reporting.
- Recovery is reversible: unset or correct clone-local `core.hooksPath`, or
  revert the tracked hook and happyctl changes. No remote state is changed by
  validation failure.
