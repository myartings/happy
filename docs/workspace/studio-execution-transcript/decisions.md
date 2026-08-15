# Decisions: `studio-execution-transcript`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | What is authoritative? | accepted | Happy data first; Codex CLI open semantics second; CommonMark/GFM, ANSI/xterm, and Pierre public contracts third; screenshots only for calibration. |
| D2 | Where may semantic color appear? | accepted | Commands, paths, terminal runs, statuses, links, and diffs; ordinary prose stays neutral. |
| D3 | Is this a terminal emulator? | accepted | No. Render safe, read-only historical output with selection/copy and no PTY, input, or escape-sequence actions. |
| D4 | Does this replace diff parsing? | accepted | No. Pierre remains authoritative; only surrounding semantic hierarchy may align. |
| D5 | What is the first slice? | accepted | Actual shell/terminal tool shapes already present in Happy; provider variants require observed fixtures, not speculative fields. |
