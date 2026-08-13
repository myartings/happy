import { describe, expect, it } from 'vitest';
import { parseMarkdown } from './parseMarkdown';

const item = (spans: { styles: string[]; text: string; url: string | null }[]) => ({
    depth: 0,
    spans,
});

describe('parseMarkdown', () => {
    it('parses blockquotes and strikethrough without flattening their meaning', () => {
        const blocks = parseMarkdown([
            '> A restrained quote with ~~obsolete~~ guidance.',
            '> Keep the second line selectable.',
        ].join('\n'), { enableStudioExtensions: true });

        expect(blocks).toEqual([{
            type: 'blockquote',
            content: [
                { styles: [], text: 'A restrained quote with ', url: null },
                { styles: ['strikethrough'], text: 'obsolete', url: null },
                { styles: [], text: ' guidance.\nKeep the second line selectable.', url: null },
            ],
        }]);
    });

    it('preserves legacy plain text when Studio extensions are not enabled', () => {
        const blocks = parseMarkdown('> Keep ~~literal markers~~ outside packaged Studio.');

        expect(blocks).toEqual([{
            type: 'text',
            content: [{
                styles: [],
                text: '> Keep ~~literal markers~~ outside packaged Studio.',
                url: null,
            }],
        }]);
    });

    it('preserves nested depth for ordered and unordered lists', () => {
        const blocks = parseMarkdown([
            '- outer',
            '  - nested',
            '    - deep',
            '',
            '1. first',
            '  2. second',
        ].join('\n'));

        expect(blocks.filter((block) => block.type === 'list')[0]).toMatchObject({
            items: [{ depth: 0 }, { depth: 1 }, { depth: 2 }],
        });
        expect(blocks.filter((block) => block.type === 'numbered-list')[0]).toMatchObject({
            items: [{ number: 1, depth: 0 }, { number: 2, depth: 1 }],
        });
    });

    it('parses unordered lists across common markdown bullet markers and preserves clickable links', () => {
        const blocks = parseMarkdown([
            '* first item',
            '+ second item with [docs](https://example.com/docs)',
            '- third item with https://example.com/raw.',
        ].join('\n'));

        expect(blocks).toHaveLength(1);
        expect(blocks[0]?.type).toBe('list');

        if (blocks[0]?.type !== 'list') {
            throw new Error('Expected markdown list block');
        }

        expect(blocks[0].items).toHaveLength(3);
        expect(blocks[0].items[1]).toEqual(item([
            { styles: [], text: 'second item with ', url: null },
            { styles: [], text: 'docs', url: 'https://example.com/docs' },
        ]));
        expect(blocks[0].items[2]).toEqual(item([
            { styles: [], text: 'third item with ', url: null },
            { styles: [], text: 'https://example.com/raw', url: 'https://example.com/raw' },
            { styles: [], text: '.', url: null },
        ]));
    });

    it('parses standalone markdown image blocks', () => {
        const blocks = parseMarkdown('![Markdown renderable image](data:image/png;base64,abc123)');

        expect(blocks).toEqual([
            {
                type: 'image',
                alt: 'Markdown renderable image',
                url: 'data:image/png;base64,abc123',
            },
        ]);
    });

    it('auto-linkifies bare URLs in text blocks', () => {
        const blocks = parseMarkdown('Visit https://example.com/docs for more.');

        expect(blocks).toHaveLength(1);
        expect(blocks[0]?.type).toBe('text');

        if (blocks[0]?.type !== 'text') {
            throw new Error('Expected markdown text block');
        }

        expect(blocks[0].content).toEqual([
            { styles: [], text: 'Visit ', url: null },
            { styles: [], text: 'https://example.com/docs', url: 'https://example.com/docs' },
            { styles: [], text: ' for more.', url: null },
        ]);
    });
});
