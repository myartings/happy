import { describe, expect, it } from 'vitest';

import {
    resolveMarkdownSpanRoles,
    resolveMarkdownSpanPresentationStyles,
    resolveStudioMarkdownOptionState,
    resolveStudioSemanticTextPresentation,
} from './studioSemanticTextPresentation';
import { parseMarkdown } from '../../components/markdown/parseMarkdown';

describe('resolveStudioSemanticTextPresentation', () => {
    it('returns a Codex-led semantic hierarchy for packaged Studio desktop', () => {
        const presentation = resolveStudioSemanticTextPresentation({
            isTauriRuntime: true,
            requestedStyle: 'studio',
            dark: false,
        });

        expect(presentation).toMatchObject({
            visualStyle: 'studio',
            roles: {
                body: { color: '#2D2D2D' },
                heading: { color: '#202020', fontWeight: '700' },
                emphasis: { color: '#252525', fontWeight: '600' },
                link: { color: '#3F6B8F', textDecorationLine: 'underline' },
                inlineCode: { color: '#34302C', backgroundColor: '#F2F1EF' },
                statusSuccess: { color: '#2E6A4F' },
                statusWarning: { color: '#8A6428' },
                statusError: { color: '#A23D3D' },
                statusSecondary: { color: '#707070' },
            },
            body: { fontSize: 15, lineHeight: 23 },
            headings: {
                1: { fontSize: 22, lineHeight: 29 },
                2: { fontSize: 18, lineHeight: 26 },
                3: { fontSize: 16, lineHeight: 24 },
                6: { fontSize: 15, lineHeight: 23 },
            },
            list: { gap: 4, indent: 18, markerColor: '#707070' },
            blockquote: {
                backgroundColor: '#F7F7F6',
                borderColor: '#D8D6D2',
                borderLeftWidth: 3,
            },
            horizontalRule: { backgroundColor: '#E2E0DC' },
            table: {
                borderColor: '#DFDDD9',
                headerBackgroundColor: '#F4F3F1',
            },
            codeChrome: {
                labelColor: '#707070',
                copyBackgroundColor: '#FFFFFF',
            },
            options: {
                gap: 6,
                marginVertical: 8,
                minHeight: 40,
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 9,
                borderWidth: 1,
                backgroundColor: '#F7F7F6',
                borderColor: '#E5E3DF',
                pressedBackgroundColor: '#EEEDEB',
                textColor: '#2D2D2D',
                fontSize: 14,
                lineHeight: 20,
            },
        });
    });

    it('uses restrained dark surfaces with equivalent semantic structure', () => {
        const presentation = resolveStudioSemanticTextPresentation({
            isTauriRuntime: true,
            requestedStyle: 'studio',
            dark: true,
        });

        expect(presentation).toMatchObject({
            blockquote: { backgroundColor: '#262626', borderColor: '#55514C' },
            horizontalRule: { backgroundColor: '#414141' },
            table: { borderColor: '#414141', headerBackgroundColor: '#2D2D2D' },
            codeChrome: { labelColor: '#A6A6A6', copyBackgroundColor: '#343434' },
            options: {
                backgroundColor: '#292929',
                borderColor: '#3C3C3C',
                pressedBackgroundColor: '#343434',
                textColor: '#E7E7E7',
            },
        });
    });

    it('keeps mobile and standalone web rendering unchanged', () => {
        expect(resolveStudioSemanticTextPresentation({
            isTauriRuntime: false,
            requestedStyle: 'default',
            dark: false,
        })).toBeNull();
        expect(resolveStudioSemanticTextPresentation({
            isTauriRuntime: false,
            requestedStyle: 'studio',
            dark: false,
        })).toBeNull();
    });

    it('forces Studio on desktop without exposing it elsewhere', () => {
        expect(resolveStudioSemanticTextPresentation({
            isTauriRuntime: true,
            requestedStyle: 'studio',
            previewStyle: 'default',
            dark: true,
        })?.roles.body.color).toBe('#E7E7E7');
        expect(resolveStudioSemanticTextPresentation({
            isTauriRuntime: false,
            requestedStyle: 'default',
            previewStyle: 'studio',
            dark: true,
        })).toBeNull();
    });
});

describe('resolveStudioMarkdownOptionState', () => {
    it('keeps the resting surface quiet and gives hover, focus, and press distinct feedback', () => {
        const presentation = resolveStudioSemanticTextPresentation({
            isTauriRuntime: true,
            requestedStyle: 'studio',
            dark: false,
        });
        if (!presentation) throw new Error('Expected Studio presentation');

        expect(resolveStudioMarkdownOptionState(presentation, {
            focused: false, hovered: false, pressed: false,
        })).toEqual({
            backgroundColor: '#F7F7F6',
            borderColor: '#E5E3DF',
        });
        expect(resolveStudioMarkdownOptionState(presentation, {
            focused: false, hovered: true, pressed: false,
        })).toEqual({
            backgroundColor: '#F1F0EE',
            borderColor: '#DAD8D4',
        });
        expect(resolveStudioMarkdownOptionState(presentation, {
            focused: true, hovered: false, pressed: false,
        })).toEqual({
            backgroundColor: '#F7F7F6',
            borderColor: 'rgba(70, 111, 226, 0.82)',
        });
        expect(resolveStudioMarkdownOptionState(presentation, {
            focused: false, hovered: false, pressed: true,
        })).toEqual({
            backgroundColor: '#EEEDEB',
            borderColor: '#DAD8D4',
        });
    });
});

describe('resolveMarkdownSpanRoles', () => {
    it('maps parsed Markdown command, path, number, and emphasized status labels into production roles', () => {
        const blocks = parseMarkdown([
            'Run `pnpm typecheck`, inspect `/tmp/happy/report.json`, count `128`,',
            'then mark **Complete**, **Warning**, **Failed**, or **Queued**.',
        ].join(' '), { enableStudioExtensions: true });
        const block = blocks[0];
        if (block?.type !== 'text') throw new Error('Expected text block');

        const rolesByText = Object.fromEntries(block.content.map((span) => [
            span.text,
            resolveMarkdownSpanRoles(span, false),
        ]));

        expect(rolesByText).toMatchObject({
            'pnpm typecheck': ['inlineCode', 'command'],
            '/tmp/happy/report.json': ['inlineCode', 'path'],
            '128': ['inlineCode', 'number'],
            'Complete': ['emphasis', 'statusSuccess'],
            'Warning': ['emphasis', 'statusWarning'],
            'Failed': ['emphasis', 'statusError'],
            'Queued': ['emphasis', 'statusSecondary'],
        });
    });

    it('composes parsed semantic roles into the concrete styles consumed by MarkdownView', () => {
        const presentation = resolveStudioSemanticTextPresentation({
            isTauriRuntime: true,
            requestedStyle: 'studio',
            dark: false,
        });
        const blocks = parseMarkdown('Run `pnpm typecheck` with `128`; result **Complete**.', {
            enableStudioExtensions: true,
        });
        const block = blocks[0];
        if (!presentation || block?.type !== 'text') throw new Error('Expected Studio text presentation');

        const stylesByText = Object.fromEntries(block.content.map((span) => [
            span.text,
            resolveMarkdownSpanPresentationStyles(span, false, presentation),
        ]));

        expect(stylesByText['pnpm typecheck']).toEqual([
            presentation.roles.inlineCode,
            presentation.inlineCode,
            presentation.roles.command,
        ]);
        expect(stylesByText['128']).toEqual([
            presentation.roles.inlineCode,
            presentation.inlineCode,
            presentation.roles.number,
        ]);
        expect(stylesByText.Complete).toEqual([
            presentation.roles.emphasis,
            presentation.roles.statusSuccess,
        ]);
    });

    it('does not color ordinary prose that happens to contain status or path-like words', () => {
        const blocks = parseMarkdown('Complete warning failed queued /tmp/report 128');
        const block = blocks[0];
        if (block?.type !== 'text') throw new Error('Expected text block');

        expect(block.content.flatMap((span) => resolveMarkdownSpanRoles(span, false))).toEqual([]);
    });

    it('maps Markdown meaning to shared semantic roles without changing text', () => {
        expect(resolveMarkdownSpanRoles({
            text: 'docs',
            url: 'https://example.com',
            styles: ['bold', 'code'],
        }, true)).toEqual(['emphasis', 'inlineCode', 'link']);
        expect(resolveMarkdownSpanRoles({
            text: 'plain',
            url: null,
            styles: [],
        })).toEqual([]);
        expect(resolveMarkdownSpanRoles({
            text: 'unsafe',
            url: 'javascript:alert(1)',
            styles: [],
        }, false)).toEqual([]);
    });
});
