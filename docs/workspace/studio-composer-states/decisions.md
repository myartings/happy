# Decisions: `studio-composer-states`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | What activates the state refinements? | resolved | Reuse the packaged-Tauri-only Studio resolver; Default and non-Tauri remain unchanged. |
| D2 | May controls move or behavior change? | resolved | No. Existing order, callbacks, keyboard behavior, and accessibility semantics remain authoritative. |
| D3 | How are overlapping states prioritized? | resolved | Abort in progress, abort available, sending, picker/autocomplete, attachment, ready text, then empty; presentation only. |
| D4 | Who accepts visual quality? | resolved | The user after parent-owned integrated packaged screenshots. |
