# Risk Assessment: `happy-desktop-official-release`

Status: cleared with controls.

| Risk | Control | Rollback/evidence |
| --- | --- | --- |
| Build personal product changes as “official” | Require `upstream/main` ancestor and allowlisted diff only | Abort before build; report validated SHAs |
| Disturb active `dev` workspace | Detached dedicated baseline worktree | Caller branch/status asserted unchanged in tests |
| Replace development app | Separate app name and bundle identifier | Dev install path never targeted |
| Lose prior baseline install | Complete build/sign first; backup before replacement | Restore latest profile-specific backup |
| Unstable/ad-hoc signature | Existing stable identity resolver and strict signature verification | Abort before installation |
| Accidental public release or branch push | No publish/push primitives in official-baseline path | Scope and smoke checks prohibit them |
| Interrupted replacement | Backup then bounded replace/verify; preserve backup | Manual `rollback-desktop` under official profile |
