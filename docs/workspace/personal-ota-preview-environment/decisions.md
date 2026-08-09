# Decisions: `personal-ota-preview-environment`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | Which EAS environment should personal OTA load? | resolved | Use `preview`, matching `build.personal` and `build.personal-store` on the current supported Expo plan. |
| D2 | Should the OTA channel or app variant change? | resolved | No. Keep channel `personal`, `APP_ENV=personal`, and production JS mode; only align the EAS variable environment. |
