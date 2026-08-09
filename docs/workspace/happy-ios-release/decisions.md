# Decisions: `happy-ios-release`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | Which native build system owns Happy iOS release? | accepted | EAS owns Expo native builds/signing; the native template contributes release gates and evidence, not XcodeGen commands. |
| D2 | How are internal and TestFlight builds separated? | accepted | Dedicated `personal` and `personal-store` profiles; all manager commands name the profile explicitly. |
| D3 | Is the private OTA server changed now? | accepted | No. Its cross-app manifest collision is repaired in the reusable template procedure, but production server migration is a separate deployment. |
| D4 | Where do credentials live? | accepted | Local `config.env`/EAS credential storage only; no tracked secrets or personal credential identifiers. |
