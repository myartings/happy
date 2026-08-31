import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const markdownView = readFileSync(
    new URL('../../components/markdown/MarkdownView.tsx', import.meta.url),
    'utf8',
);

describe('Studio rich-text renderer wiring', () => {
    it('wires accepted block presentation through the existing Markdown renderer', () => {
        expect(markdownView).toContain('const enableStudioExtensions = studioPresentation !== null;');
        expect(markdownView).toContain('enableStudioExtensions,');
        expect(markdownView).toContain('resolveMarkdownSpanPresentationStyles(');
        expect(markdownView).toContain("block.type === 'blockquote'");
        expect(markdownView).toContain('props.studioPresentation?.blockquote');
        expect(markdownView).toContain('studioPresentation?.horizontalRule');
        expect(markdownView).toContain('props.studioPresentation?.list');
        expect(markdownView).toContain('props.studioPresentation?.table');
        expect(markdownView).toContain('props.studioPresentation?.codeChrome');
        expect(markdownView).toContain('props.studioPresentation?.options');
    });

    it('retains selection, trusted-link, copy, scrolling, Mermaid, options, and images', () => {
        expect(markdownView).toContain("const selectable = Platform.OS === 'web' || !(markdownCopyV2 || props.externalCopyHandler);");
        expect(markdownView).toContain('isHttpMarkdownLink(url)');
        expect(markdownView).toContain('Clipboard.setStringAsync(props.content)');
        expect(markdownView.match(/<HorizontalScrollView/g)).toHaveLength(2);
        expect(markdownView).toContain('<MermaidRenderer');
        expect(markdownView).toContain('<RenderOptionsBlock');
        expect(markdownView).toContain('<RenderImageBlock');
    });
});
