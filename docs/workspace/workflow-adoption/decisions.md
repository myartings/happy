# Decisions: `workflow-adoption`

- Keep `scripts/workflow-ci.py` as a Happy-preserved adaptation because Git
  reports POSIX paths even when Python's `Path` renders Windows separators.

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | Full template sync or selective adoption? | accepted | Selective workflow core; Happy-owned rules, skills, CI, and release behavior remain intact. |
| D2 | Which branch receives the workflow? | accepted | Personal branch from `origin/dev`; keep upstream-tracking `main` clean. |
| D3 | Product checks during bootstrap? | accepted | Record workflow-core checks now; configure real pnpm typecheck/test families for future product features. |
