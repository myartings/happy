# Decisions: `personal-eas-preview-environment`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | Which EAS environment works on the current Expo plan? | accepted | Use default `preview`; EAS rejected custom `personal` because custom environments require Production or Enterprise. |
| D2 | Does `preview` collide with the other project? | accepted | No account-wide or project variables exist in `preview`; new values are scoped to `@myartings/happy-personal`. |
