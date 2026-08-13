import { describe, expect, it } from 'vitest';

import {
    resolveMarkdownSpanRoles,
    resolveStudioSemanticTextPresentation,
} from './studioSemanticTextPresentation';

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
        });
    });

    it('keeps Default, mobile, and standalone web rendering unchanged', () => {
        expect(resolveStudioSemanticTextPresentation({
            isTauriRuntime: true,
            requestedStyle: 'default',
            dark: false,
        })).toBeNull();
        expect(resolveStudioSemanticTextPresentation({
            isTauriRuntime: false,
            requestedStyle: 'studio',
            dark: false,
        })).toBeNull();
    });

    it('supports the desktop preview override without exposing Studio elsewhere', () => {
        expect(resolveStudioSemanticTextPresentation({
            isTauriRuntime: true,
            requestedStyle: 'default',
            previewStyle: 'studio',
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

describe('resolveMarkdownSpanRoles', () => {
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
