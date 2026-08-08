---
name: implement
description: Implement the smallest accepted task slice while preserving repository boundaries and validating incrementally. Use when planning gates are satisfied and the user asks to build, change, fix, refactor, or complete an approved coding task.
---

# Implement Work

## Workflow

1. Require a `ready` or `ready-with-recorded-gaps` result from `scoping` for
   every formal task. Enter implementation with
   `python3 scripts/workflow-state.py transition <slug> implementation "<next>"`;
   a rejected transition is a hard stop.
2. Run strict audit with `--require-active`, then reconfirm allowed scope,
   protected paths, acceptance criteria, and dirty files.
   Load the repository-relative paths in `contexts/implement.jsonl`; do not
   automatically load verification-only context.
3. Use `tdd` when logic has a stable test seam; otherwise identify the closest
   deterministic feedback signal before editing.
4. Make one coherent slice at a time and avoid opportunistic adjacent refactors.
5. Run targeted checks after each meaningful slice using `.ai/project.json`.
6. Update task state and `validation.md` with exact evidence.
7. Stop and route to `diagnose` after unexpected failures or repeated fixes.
8. When the accepted implementation slice is complete, record
   `implementation=passed`, transition to `verification`, and hand it to `check`.
   Do not claim final completion or create a final commit from this skill.

Preserve public contracts unless the accepted spec explicitly changes them.
