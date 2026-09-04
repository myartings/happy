# Decisions: `daemon-bundle-handoff-sessions`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | How should Sessions survive a systemd `KillMode=control-group` daemon handoff? | resolved | Place daemon-owned Sessions in separate transient user scopes. Detached POSIX process groups alone do not cross cgroup kill boundaries; automatic provider resume risks duplicating in-flight work. |
| D2 | How may a replacement daemon reclaim live Session control? | resolved | Persist an optional daemon-owned protection marker and non-secret OS process identity; adopt only an exact live match and otherwise keep the record as resume history. |
| D3 | Should the repository change the user's systemd unit? | resolved | No. Preserve external service configuration and make the daemon safe under the observed default `KillMode=control-group`. |
| D4 | Is an ADR required? | resolved | No. The decision is bounded to the daemon process-lifecycle implementation, source-reversible, and fully captured by the feature spec and tests. |
