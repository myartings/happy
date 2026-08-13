# Finish Review: `studio-rich-text-review-fixes`

## Summary

- Added an explicit parser extension option and enabled it from MarkdownView
  only when the packaged Tauri + Studio presentation resolver is non-null.
- Added conservative production classification for inline-code commands,
  paths, and numbers plus exact emphasized status labels.
- Extracted the role-to-style composition function consumed by MarkdownView so
  parsed spans, semantic roles, and final presentation styles share one tested
  production path.

## Verification

- Three RED/GREEN tracer bullets are recorded in `validation.md`.
- Focused Markdown/semantic suite: 8 files, 35 tests passed.
- Happy App typecheck and `git diff --check` passed.
- Workflow checks passed 4/4 after the review-driven implementation follow-up.

## Whole-diff review

- No blocking findings remain.
- Default parser behavior leaves blockquote and strikethrough markers literal;
  only non-null packaged Studio presentation enables extensions.
- Semantic classifiers require inline code or exact emphasized status labels,
  preventing decorative coloring of ordinary prose.
- No MessageView, tool/diff, layout, storage, protocol, or other excluded file
  changed.

## Rollback or mitigation

- Revert this incremental commit; original `2d794d46` remains independently
  revertible by the parent.

## Lessons promoted

- `CONTEXT.md`: none.
- `docs/ARCHITECTURE.md` or ADR: none; no architectural contract changed.
- Skill/workflow rule: none.

## Follow-up

- Parent integrates only this incremental commit after the already-integrated
  `2d794d46`, reruns integration checks, and performs packaged visual acceptance.
