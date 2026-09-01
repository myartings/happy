# GitHub Issue current Happy Session association

Status: accepted client-only contract; GitHub Issue #79 body reconciled and
verified on 2026-08-31; implementation in progress

## Outcome

Within one Happy account, the personal Happy client gives each GitHub Issue one
current Happy Session across Sessions hosted by Windows, macOS, Linux, or other
registered Happy daemons. The client coordinates through the official server's
existing encrypted account KV interface. No Happy Server, database, daemon, or
native-platform change is part of this feature.

This is a client-managed current association, not a universal server-enforced
canonical relation.

## Domain terms

- **Issue identity**: GitHub host, stable repository id, and stable Issue node
  id. Owner, repository name, Issue number, URL, and title are display data.
- **Current Session**: the one Session a compatible client opens or resumes for
  an associated Issue.
- **Participating client**: a personal Happy client version that implements
  this Spec.
- **Daemon platform**: the machine and OS hosting a Session. It does not affect
  association identity.
- **Transfer marker**: a direct, encrypted pointer on the former Session saying
  its Issue association moved to the new current Session. It is not a history
  timeline.

## Observable behavior

### Resolve

Opening an Issue derives its opaque Issue KV key and resolves the current
Session. A valid current Session is offered as the sole Continue target even
when it is hosted by another daemon platform.

An unavailable network uses the last valid local projection with a visible
Cached/Offline state. A missing or unreadable current Session is never silently
treated as unbound; it enters Repair.

### Associate an existing Session

An unassociated Issue may adopt one current, unassociated Session from the same
stable GitHub repository. The user sees the daemon/machine and Session identity
and confirms the association. Arbitrary fuzzy matching is not used.

### Create a Session

The normal New Session flow carries structured Issue intent and lets the user
choose any available daemon platform. After Session creation:

1. the client atomically claims the Issue and Session KV directions;
2. it reconciles conflicts or ambiguous acknowledgements;
3. only the winner sends the first Issue task.

If another participating client already won, the losing client opens the
winner. Its unused Session receives no Issue task and is stopped or archived
best-effort without deleting user work.

### Cross-platform concurrency

Two clients may simultaneously create Sessions on different daemon platforms.
The existing account KV Serializable/CAS boundary selects one current Session.
Both clients converge by refetching the Issue and Session keys before any
losing first task is sent.

### Lifecycle

Stop, offline, archive, restore, app restart, rename, and daemon-platform
changes do not release the association. An archived current Session is restored
before opening when possible.

Hard deletion or undecryptable evidence produces Repair. Repair explicitly
selects or creates a replacement and never infers a Session from title, prompt,
branch, worktree, tag, or Agent Goal.

### Replacement

Replacing an intact current Session requires explicit confirmation naming the
Issue, former Session, and replacement Session. One atomic KV mutation:

- updates the Issue direction;
- creates or updates the new Session direction; and
- changes the former Session direction to a direct transfer marker.

There is no history page, append-only audit log, or chain traversal. The former
Session stays available in the ordinary Session list and may navigate to the
new current Session.

### Projection

Current associations appear on desktop Session list, header, and information
surfaces without changing Session title, `Session.tag`, provider thread id,
Agent Goal, branch, worktree, or repository workflow state. A transfer marker
is visually distinct from a current association.

### Compatibility

Feature-off and an unavailable KV endpoint preserve official behavior. Legacy
Sessions are not guessed into associations.

Old clients and direct CLI/daemon prompts do not participate and cannot be
blocked by this client-only design. The UI and documentation state that the
unique-current guarantee covers participating clients in the same account.

## Data and privacy contract

- KV key suffixes are account-keyed opaque digests.
- KV values are versioned, encrypted payloads.
- The server receives no plaintext GitHub coordinates, Issue display content,
  Session id, or transfer target.
- Local caches are account-scoped, validated before projection, and cleared on
  account change.
- GitHub credentials remain owned by the existing client Device Flow.
- Association operations perform GitHub reads only and never mutate labels,
  assignment, comments, Project state, or Issue state.

## Existing interface contract

The feature may call only the existing authenticated official endpoints:

- `GET /v1/kv/:key`;
- `POST /v1/kv/bulk`;
- `GET /v1/kv?prefix=...`; and
- `POST /v1/kv` for atomic expected-version mutations.

No endpoint, database model, daemon protocol, or socket authentication change
is allowed. Existing `kv-batch-update` events may trigger a refetch; reconnect
and Issue open must also recover without an event.

## Acceptance criteria

1. Stable GitHub ids derive an account-scoped opaque Issue key; display changes
   do not change association identity.
2. One Issue and one Session direction are mutated atomically through the
   existing KV API, with no server or daemon diff.
3. Concurrent participating clients targeting different daemon platforms
   converge on one current Session before a losing first Issue task is sent.
4. A bound Issue always continues, restores, or repairs its current Session;
   it does not prepare a second task in another Session.
5. Restart, offline cache, reconnect, archive, restore, rename, and daemon
   platform changes preserve the current association.
6. Explicit replacement is revision-safe, keeps the former Session, and shows
   only a direct transfer marker rather than a history timeline.
7. Side chats and ordinary/worktree forks start unassociated; explicit
   replacement is the only way to make one current.
8. Desktop list, header, and information surfaces expose localized,
   accessible Current, Cached/Offline, Transferred, Conflict, and Repair states
   without color-only meaning.
9. Feature-off, unavailable KV, unreadable payloads, account changes, and
   ambiguous mutation acknowledgements fail safely without raw private data or
   destructive cleanup.
10. Association behavior makes no GitHub mutation, changes no existing Session
    identity field, and does not claim enforcement over non-participating
    clients or direct CLI/daemon work.

## Verification

| Criterion | Evidence |
| --- | --- |
| AC1 | identity and encryption fixtures using stable GitHub ids |
| AC2–AC3 | KV adapter contract tests, atomic two-key race, conflict and ambiguous-ack reconciliation tests |
| AC4–AC5 | dispatch, restart/offline, reconnect, archive/restore and missing-Session tests |
| AC6 | expected-version replacement and direct transfer-marker tests |
| AC7 | side-chat and fork non-inheritance tests |
| AC8 | desktop component, localization, accessibility and target-size tests |
| AC9 | feature-off, account-generation, unreadable-data and compensation tests |
| AC10 | official-base server diff inspection and GitHub transport zero-mutation tests |

Final verification includes both App and Server typechecks/tests because the
repository candidate must prove the server returned to its accepted base, the
app's focused suites, `python scripts/workflow-check.py --applicable`, and
fresh High-risk Spec and Standards review. Live acceptance uses two isolated
daemon platforms or machines under a non-production account; it requires no
mobile target or external PostgreSQL.

## Non-goals

- Modifying or deploying Happy Server, PostgreSQL, Prisma, sockets, or daemon
  protocol.
- Enforcing association behavior in official/old clients or direct CLI input.
- Full association history, audit timeline, GitHub workflow automation, or
  GitHub Issue mutation.
- Mobile acceptance or official-upstream release.

## Rollback

Disable the personal client feature. Existing opaque KV records may remain
encrypted and inert or be removed later by a separately validated cleanup.
Rollback never changes official server schema, Session data, or GitHub state.
