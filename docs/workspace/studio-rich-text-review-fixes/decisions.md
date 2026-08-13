# Decisions: `studio-rich-text-review-fixes`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | How do semantic roles reach production rendering? | accepted | Extend the existing production `resolveMarkdownSpanRoles` path with conservative, context-bound recognition: commands/paths/numbers only inside inline code and statuses only inside emphasized exact status labels. Test the real parse-to-role pipeline, not fixture declarations or source text. |
| D2 | How are Studio-only extensions gated? | accepted | `parseMarkdown` accepts an explicit `enableStudioExtensions` option. `MarkdownView` enables it only when `useStudioSemanticTextPresentation()` returns a packaged Tauri + Studio presentation; parser default preserves legacy behavior. |
| D3 | Compatibility boundary | accepted | Default, standalone Web, iOS, and Android continue rendering blockquote/strikethrough source as legacy plain text. Existing standard Markdown, trusted links, selection/copy, and tool/diff paths remain unchanged. |
| D4 | Risk | accepted | Parser/presentation-only follow-up triggers none of `.ai/project.json` high-consequence risks. |
