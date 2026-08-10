# Decisions: `personal-ota-actions-fix`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | How should OTA run when the workflow is not on the default branch? | resolved | Push a dedicated `personal-ota/android/*` tag that points to a commit contained in `origin/dev`; GitHub evaluates push workflows from the tagged ref. |
| D2 | Should the personal workflow be added to `main`? | resolved | No. `main` remains clean and tracks official upstream as required by repository policy. |
| D3 | How should Android fingerprinting avoid the unrelated iOS failure? | resolved | Generate and validate an Android-only fingerprint before publish, then skip EAS CLI's redundant automatic all-platform fingerprint pass for Android releases only. |
| D4 | What happens to manual dispatch? | resolved | Keep it for forward compatibility, but the supported path while the workflow is absent from default `main` is the Android release tag. |
| D5 | How is an accidental tag on the wrong commit prevented from deploying? | resolved | Fetch `origin/dev` and require the tagged commit to be an ancestor of it before installing dependencies or publishing. |
