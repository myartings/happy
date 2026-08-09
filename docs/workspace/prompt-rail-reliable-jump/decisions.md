# Decisions: `prompt-rail-reliable-jump`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | Why can a selected tick appear not to jump? | decided | `revealWebMessage` starts a 30-attempt retry loop, but its internal timers survive effect cleanup. Rapid selections therefore leave stale loops competing to center different messages. |
| D2 | What is the smallest reliable fix? | decided | Return a cancellation function from the retry helper and invoke it from the selection effect cleanup, so only the latest request can continue repositioning the list. |
