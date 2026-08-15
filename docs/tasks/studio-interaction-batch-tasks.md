# Studio Desktop Interaction and State Batch Tasks

## Parallel writers

- [x] A. Tool presentation: refine existing tool shells, semantic roles, status,
  errors, diffs, and code output; own `components/tools/**` and a region-local
  Studio tool-presentation feature module.
- [x] B. Composer states: refine empty/typing/attachment/autocomplete/mode/send
  states; own `AgentInput*` and `features/studio-composer/**` only.
- [x] C. Interaction states: refine Studio sidebar and overlay light/dark,
  hover/focus/selected/keyboard presentation; own sidebar/overlay regional
  adapters and their direct host seams, excluding Command Palette geometry and
  composer/tool files.

## Integration

- [x] Preserve the integration workflow as `ACTIVE.md` while retaining all
  archived child evidence.
- [x] Merge only verified local child commits in order A, B, C.
- [x] Run combined focused tests, full applicable checks, and whole-diff review.
- [x] Build, stably sign, recoverably install, and capture fixed-size packaged
  Desktop states for all three regions.
- [x] Present grouped screenshots for explicit user accept/revise decisions.
- [x] Revise rejected regions within their owning worktrees before expansion.
- [ ] Merge accepted output to local `dev`; do not push.
