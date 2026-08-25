# Decisions: `codex-options-after-thread-restart`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | How should prompt injection state be represented? | resolved | Track the Codex thread ID that received the prompt; thread identity directly models the required lifetime and avoids reset-path omissions. |
| D2 | Should reconnect behavior also be changed? | resolved | No. This fix only ensures a replacement thread receives Happy instructions; reconnect policy remains unchanged. |
