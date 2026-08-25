# Codex options after thread restart tasks

1. [x] Add a failing regression test proving a replacement Codex thread receives
   the Happy append prompt while the original thread does not receive it twice.
2. [x] Replace process-wide prompt-injected state with thread-keyed state in the
   Codex turn prompt path.
3. [x] Run targeted tests, the nearest CLI unit suite/build, workflow checks, and a
   whole-diff review.
