# Personal OTA pnpm Argument Repair

## Acceptance criteria

1. The workflow invokes `ota:personal` without forwarding a standalone `--` to
   EAS CLI.
2. EAS receives `--platform`, `--message`, and `--non-interactive` as options.
3. Channel `personal`, environment `preview`, and Android fingerprint behavior
   remain unchanged.
4. The fix itself does not publish an update; a new tag performs hosted proof.
