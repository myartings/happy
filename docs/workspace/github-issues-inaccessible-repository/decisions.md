# Decisions: `github-issues-inaccessible-repository`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | May a Session substitute another repository when the detected repository is inaccessible? | decided | No. Session Issues remain bound to the detected repository; unrelated repositories must not be offered as substitutes. |
| D2 | What should happen for `inaccessible`? | decided | Route to connection management with the detected `owner/repo`, a clear access-required message, and the existing explicit “Manage repository access” link. |
| D3 | Which picker reasons remain valid? | decided | `ambiguous`, `no-remote`, and `lookup-failed` retain the picker because no authoritative accessible repository was established. |

## Risk controls

- Blast radius is one personal GitHub Issues Session-entry UX path; credentials,
  tokens, installation configuration, and GitHub permissions are unchanged.
- The resolver may carry only the repository identity already detected from
  Session Git metadata (`owner/repo`), never a token, installation ID, or GitHub
  response payload. It remains inside local navigation state.
- External navigation remains behind the existing explicit user press; route
  rendering itself must not call GitHub or expand access.
- Existing disconnected, reauthorization, ambiguous, lookup-failed, and
  no-remote tests remain green.
- Rollback is a product-code revert plus restoring the prior client backup.
- Stop on any behavior that automatically opens GitHub, selects a substitute
  repository, reads credentials, or changes repository access.
