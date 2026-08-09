# Decisions: `personal-eas-environment-isolation`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | Modify shared production variables or isolate Personal profiles? | accepted | Use a dedicated `personal` environment; shared variables may serve other apps and must remain untouched. |
| D2 | Where do Personal project values live? | accepted | Project-scoped EAS environment variables plus untracked local manager configuration; never tracked source. |
