import { describe, expect, it } from 'vitest';
import { resolveDesktopComposerStyle } from './studioComposerStyle';

describe('Studio desktop composer style', () => {
    it('resolves the accepted elevated composer geometry in packaged Studio', () => {
        expect(resolveDesktopComposerStyle({
            isTauriRuntime: true,
            requestedStyle: 'studio',
        })).toEqual({
            visualStyle: 'studio',
            maxWidth: 800,
            shellMinHeight: 110,
            shellRadius: 20,
            shellBackground: '#FFFFFF',
            shellBorder: '#DDDDDE',
            shellBorderWidth: 1,
            shellHorizontalPadding: 12,
            shellTopPadding: 8,
            shellBottomPadding: 10,
            inputMinHeight: 56,
            actionHeight: 32,
            actionRadius: 8,
            attachmentSize: 52,
            autocompleteRowHeight: 40,
            autocompleteRadius: 12,
            showElevation: true,
        });
    });

    it('keeps Default and non-Tauri clients on the existing presentation path', () => {
        expect(resolveDesktopComposerStyle({
            isTauriRuntime: true,
            requestedStyle: 'default',
        })).toMatchObject({
            visualStyle: 'default',
            maxWidth: null,
            shellMinHeight: null,
            showElevation: false,
        });

        expect(resolveDesktopComposerStyle({
            isTauriRuntime: false,
            requestedStyle: 'studio',
            previewStyle: 'studio',
        }).visualStyle).toBe('default');
    });
});
