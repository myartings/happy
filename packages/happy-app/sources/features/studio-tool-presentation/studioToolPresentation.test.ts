import { describe, expect, it } from 'vitest';

import {
    resolveStudioActivityColor,
    resolveStudioToolPresentation,
} from './studioToolPresentation';

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
            transcript: {
                dark: false,
                backgroundColor: '#FAFAF9',
                commandColor: '#2D2D2D',
                promptColor: '#327078',
                successColor: '#2E6A4F',
                errorColor: '#A23D3D',
                fontSize: 13,
                lineHeight: 19,
            },
            activity: {
                terminalColor: '#327078',
                exploreColor: '#3F6B8F',
                editColor: '#2E6A4F',
                taskColor: '#76558B',
                neutralColor: '#707070',
                runningColor: '#327078',
                errorColor: '#A23D3D',
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
            transcript: { dark: true, backgroundColor: '#232323', commandColor: '#E7E7E7', successColor: '#80B99D', errorColor: '#DC8A8A' },
            activity: {
                terminalColor: '#85C1C7',
                exploreColor: '#8DB6D7',
                editColor: '#80B99D',
                taskColor: '#C8AED9',
                neutralColor: '#A6A6A6',
                runningColor: '#85C1C7',
                errorColor: '#DC8A8A',
            },
        });
        expect(dark?.shell.borderRadius).toBe(light?.shell.borderRadius);
        expect(dark?.compactRow).toEqual(light?.compactRow);
    });

    it('prioritizes running and failure state over activity category', () => {
        const presentation = resolveStudioToolPresentation({
            dark: false,
            isTauriRuntime: true,
            requestedStyle: 'studio',
        });
        expect(presentation).not.toBeNull();
        if (!presentation) return;

        expect(resolveStudioActivityColor(presentation, 'terminal', 'completed')).toBe('#327078');
        expect(resolveStudioActivityColor(presentation, 'read', 'completed')).toBe('#3F6B8F');
        expect(resolveStudioActivityColor(presentation, 'search', 'completed')).toBe('#3F6B8F');
        expect(resolveStudioActivityColor(presentation, 'edit', 'completed')).toBe('#2E6A4F');
        expect(resolveStudioActivityColor(presentation, 'task', 'completed')).toBe('#76558B');
        expect(resolveStudioActivityColor(presentation, 'terminal', 'running')).toBe('#327078');
        expect(resolveStudioActivityColor(presentation, 'edit', 'error')).toBe('#A23D3D');
        expect(resolveStudioActivityColor(presentation, null, 'completed')).toBe('#707070');
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
