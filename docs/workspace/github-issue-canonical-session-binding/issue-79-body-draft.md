## Outcome

Give each GitHub Issue one **current Happy Session** within a Happy account,
including Sessions hosted by Windows, macOS, or Linux daemons. Compatible Happy
clients coordinate the association through the official server's existing
encrypted account KV API.

This is a pure-client feature. It does not modify or deploy Happy Server,
PostgreSQL, Prisma, sockets, daemon/CLI protocols, native platform code, or
mobile clients.

## Behavior

- Opening an Issue resolves and offers its current Session as the sole
  Continue target, regardless of the daemon platform hosting it.
- An unassociated Issue may adopt one confirmed, unassociated Session from the
  same stable GitHub repository, or create a Session on any available daemon.
- Session creation claims both opaque Issue-to-Session and Session-to-Issue KV
  directions atomically before sending the first Issue task.
- Concurrent compatible clients converge on the KV winner. A losing candidate
  sends no Issue task and is stopped or archived best-effort while preserving
  user drafts and work.
- Restart, offline cache, reconnect, archive, restore, rename, and daemon moves
  preserve the current association. Missing or unreadable evidence enters an
  explicit Repair flow.
- Replacement is revision-safe and explicitly confirmed. The former Session
  stays available and may show one direct encrypted “transferred to current
  Session” marker; there is no full association history.
- Side chats and ordinary/worktree forks start unassociated.
- Desktop Session list, header, and information surfaces show localized,
  accessible Current, Cached/Offline, Transferred, Conflict, and Repair states.

## Privacy and compatibility

- KV keys use account-keyed opaque digests and KV values are encrypted.
- The server receives no plaintext GitHub coordinates, Issue display content,
  Session id, or transfer target.
- The feature never mutates GitHub and does not reuse Session title, tag,
  provider thread id, Agent Goal, branch, or worktree as authority.
- The guarantee covers compatible Happy clients in the same account. A
  client-only design cannot constrain old clients or direct CLI/daemon prompts.
- Feature-off or unavailable KV preserves official behavior and fails closed
  before first Issue-task send.

## Acceptance criteria

1. Stable GitHub ids derive an account-scoped opaque Issue key; display changes
   do not change association identity.
2. The Issue and Session directions mutate atomically through the existing KV
   API, with no server or daemon diff.
3. Concurrent compatible clients on different daemon platforms converge on one
   current Session before a losing first task is sent.
4. A bound Issue continues, restores, or repairs its current Session instead
   of preparing a second task elsewhere.
5. Restart, offline/reconnect, archive/restore, rename, and daemon-platform
   changes preserve the association.
6. Explicit replacement is revision-safe, preserves the former Session, and
   records only a direct transfer marker rather than a history timeline.
7. Side chats and ordinary/worktree forks do not inherit the association.
8. Desktop surfaces expose localized and accessible current/cache/transfer/
   conflict/repair states without color-only meaning.
9. Feature-off, unavailable KV, unreadable payloads, account changes, and
   ambiguous acknowledgements fail safely without destructive cleanup or raw
   private-data disclosure.
10. No GitHub mutation or existing Session identity-field change occurs, and
    the product does not claim enforcement over non-participating clients.

## Verification

- Focused identity/encryption, KV CAS/race, dispatch, lifecycle, replacement,
  fork, account-change, projection, localization, and accessibility tests.
- App tests/typecheck and Server base-diff tests/typecheck to prove no server
  change remains.
- `python scripts/workflow-check.py --applicable` and fresh independent Spec
  and Standards review of one pinned client-only candidate.
- Live convergence on two isolated desktop daemon platforms or machines under
  a non-production account; no mobile target or external PostgreSQL required.

## Non-goals

- Happy Server/database/daemon/native/mobile changes or deployment.
- Enforcement in official/old clients or direct CLI input.
- Full association history or GitHub workflow automation.
