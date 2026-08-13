# Decisions: `studio-rich-text`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | Visual basis | accepted | Codex is the primary evidence-backed basis; Otty font metadata is supporting evidence only. No proprietary assets are copied. |
| D2 | Runtime boundary | accepted | New presentation resolves only for packaged Tauri Desktop with Studio selected; Default, standalone web, iOS, and Android retain existing behavior. |
| D3 | Parser additions | accepted | Add only accepted constructs that are currently absent and can be deterministically parsed and tested: blockquotes and strikethrough. |
| D4 | Message host seam | accepted | Avoid `MessageView`; the deterministic fixture remains inside the semantic-text feature and is rendered through the existing `MarkdownView` path during parent visual validation. |
| D5 | Risk assessment | accepted | UI-only parser/presentation changes trigger none of `.ai/project.json` authentication, authorization, migration, privacy, security, deployment, protocol, or synchronization risks. |
