import { describe, expect, it } from 'vitest';

import { resolveStudioToolPresentation } from './studioToolPresentation';

describe('Studio tool presentation', () => {
    it('resolves a compact contained hierarchy for packaged light Studio', () => {
        expect(resolveStudioToolPresentation({
            dark: false,
            isTauriRuntime: true,
            requestedStyle: 'studio',
        })).toMatchObject({
            visualStyle: 'studio',
            shell: {
                backgroundColor: '#F7F7F6',
                borderColor: '#E7E6E3',
                borderRadius: 12,
                borderWidth: 1,
                marginVertical: 6,
            },
            header: {
                minHeight: 42,
                paddingHorizontal: 12,
                paddingVertical: 9,
            },
            compactRow: {
                minHeight: 26,
                paddingHorizontal: 4,
                paddingVertical: 2,
                fontSize: 14,
                lineHeight: 20,
            },
            disclosureRow: {
                minHeight: 30,
                paddingHorizontal: 12,
                paddingVertical: 4,
                fontSize: 13,
                lineHeight: 18,
            },
            section: {
                marginBottom: 10,
                titleFontSize: 11,
                titleLineHeight: 16,
            },
            error: {
                backgroundColor: '#FFF8F7',
                borderColor: '#E9CFCC',
                textColor: '#973D37',
            },
            diff: {
                backgroundColor: '#FAFAF9',
                borderColor: '#E7E6E3',
                addedColor: '#2E6A4F',
                removedColor: '#A23D3D',
            },
        });
    });

    it('resolves the dark semantic variant without changing its geometry', () => {
        const light = resolveStudioToolPresentation({
            dark: false,
            isTauriRuntime: true,
            requestedStyle: 'studio',
        });
        const dark = resolveStudioToolPresentation({
            dark: true,
            isTauriRuntime: true,
            requestedStyle: 'studio',
        });

        expect(dark).toMatchObject({
            shell: { backgroundColor: '#272727', borderColor: '#3B3B3B' },
            error: { backgroundColor: '#352929', borderColor: '#5A3A3A', textColor: '#DC8A8A' },
            diff: { backgroundColor: '#2C2C2C', addedColor: '#80B99D', removedColor: '#DC8A8A' },
        });
        expect(dark?.shell.borderRadius).toBe(light?.shell.borderRadius);
        expect(dark?.compactRow).toEqual(light?.compactRow);
    });

    it('fails closed outside packaged Studio and honors the preview override', () => {
        expect(resolveStudioToolPresentation({
            dark: false,
            isTauriRuntime: false,
            requestedStyle: 'studio',
        })).toBeNull();
        expect(resolveStudioToolPresentation({
            dark: false,
            isTauriRuntime: true,
            requestedStyle: 'default',
        })).toBeNull();
        expect(resolveStudioToolPresentation({
            dark: false,
            isTauriRuntime: true,
            requestedStyle: 'default',
            previewStyle: 'studio',
        })?.visualStyle).toBe('studio');
    });
});
