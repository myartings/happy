# Decisions: `codex-initial-permission-mode-sync-dev-integration`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | How should the two code conflicts be resolved? | accepted | Preserve `dev`'s launch initialization and awaitable metadata tests, while replacing the legacy reconnect identity check with the reviewed `reconnectCredentials` path and retaining its CAS revision test. |
| D2 | Which branch receives the personal fix? | accepted | Publish the feature branch and merge by PR into personal `dev`; do not modify official `main`. |
| D3 | May merge-local lifecycle evidence be created? | accepted | User explicitly authorized the minimal lifecycle expansion on 2026-09-04 after staged CI required it. |
