# Decisions: `studio-composer`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | What activates this design? | resolved | Reuse the existing packaged-Tauri-only `Studio` resolver; Default and non-Tauri remain unchanged. |
| D2 | What geometry is in the first batch? | resolved | v2 Pencil evidence: max width 800, shell height about 110, radius 20, one quiet border/shadow, compact attachments and suggestions. |
| D3 | May controls move or behavior change? | resolved | No. Existing actions, order, callbacks, keyboard behavior, and accessibility semantics remain authoritative. |
| D4 | Who accepts visual parity? | resolved | The user after an integrated packaged-desktop capture; tests cannot close this gate. |
