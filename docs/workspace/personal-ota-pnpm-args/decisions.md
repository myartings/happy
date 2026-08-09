# Decisions: `personal-ota-pnpm-args`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | What is the minimum safe correction? | resolved | Remove only the redundant separator after the pnpm script name; retain platform, message, non-interactive, fingerprint, and environment behavior. |
| D2 | Should the failed tag be reused? | resolved | No. Preserve it as a failed deployment record and use a new unique tag after merge. |
