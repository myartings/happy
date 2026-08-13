import { describe, expect, it } from 'vitest';

import { parseAnsiSgr } from './parseAnsiSgr';
import { semanticTextRoles } from './semanticText';
import {
    semanticTextFixtures,
    studioRichTextConstructs,
    studioRichTextMarkdownFixture,
} from './semanticTextFixtures';
import { parseMarkdown } from '../../components/markdown/parseMarkdown';

describe('semanticTextFixtures', () => {
    it('deterministically covers every accepted semantic role', () => {
        const coveredRoles = new Set(semanticTextFixtures.flatMap((fixture) => fixture.expectedRoles));

        expect([...coveredRoles].sort()).toEqual([...semanticTextRoles].sort());
        expect(new Set(semanticTextFixtures.map((fixture) => fixture.id)).size)
            .toBe(semanticTextFixtures.length);
    });

    it('includes ANSI display input with stable readable output', () => {
        const ansiFixture = semanticTextFixtures.find((fixture) => fixture.kind === 'ansi');

        expect(ansiFixture).toBeDefined();
        expect(parseAnsiSgr(ansiFixture!.input).text).toBe(ansiFixture!.readableText);
    });

    it('provides one deterministic Markdown fixture for every accepted rich-text construct', () => {
        expect(studioRichTextConstructs).toEqual([
            'paragraphs',
            'heading-1',
            'heading-2',
            'heading-3',
            'heading-4',
            'heading-5',
            'heading-6',
            'bold',
            'italic',
            'strikethrough',
            'trusted-link',
            'nested-unordered-list',
            'nested-ordered-list',
            'blockquote',
            'horizontal-rule',
            'inline-code',
            'fenced-code-language-copy',
            'table',
            'command',
            'path',
            'number',
            'status-success',
            'status-warning',
            'status-error',
            'tool-output',
            'diff-content',
        ]);

        const blocks = parseMarkdown(studioRichTextMarkdownFixture);
        expect(new Set(blocks.map((block) => block.type))).toEqual(new Set([
            'text',
            'header',
            'list',
            'numbered-list',
            'blockquote',
            'horizontal-rule',
            'code-block',
            'table',
        ]));
        expect(blocks.filter((block) => block.type === 'header')).toHaveLength(6);
        expect(studioRichTextMarkdownFixture).toContain('[trusted link](https://example.com/docs)');
        expect(studioRichTextMarkdownFixture).toContain('```typescript');
    });
});
