# Decisions: `studio-sidebar-convergence`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | What owns sidebar width? | resolved | Track A exclusively owns panel/frame width; this child will not alter it. |
| D2 | How is compatibility gated? | resolved | Reuse the resolved Studio frame/row style seam so only packaged Tauri Studio receives overrides. |
| D3 | May metadata be removed to gain density? | resolved | No. Compress row height, padding, line height, and contrast while preserving branch, repository, platform, machine, model, status, and activity data. |
| D4 | What is the top-action grammar? | resolved | New Session, Archive, and Todo use transparent resting rows with existing hover/focus/pressed/selected state layers, labels/order/callbacks, and at least 36pt controls plus hit slop. |
| D5 | Is a risk gate needed? | resolved | No `.ai/project.json` risk trigger applies to this Studio-only presentation slice. |
