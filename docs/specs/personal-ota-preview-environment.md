# Personal OTA Preview Environment

## Acceptance criteria

1. `ota:personal` loads the `preview` EAS environment used by both personal
   build profiles.
2. The command retains channel `personal`, `APP_ENV=personal`, and all existing
   non-interactive publication behavior.
3. No official production build or OTA command changes.
