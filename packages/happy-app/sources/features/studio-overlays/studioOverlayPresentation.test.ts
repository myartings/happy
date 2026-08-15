import { describe, expect, it } from 'vitest';

import {
    resolveCommandPaletteDarkSnapshot,
    resolveSessionActionsMenuPosition,
    resolveStudioOverlayDarkMode,
    resolveStudioOverlayPresentation,
} from './studioOverlayPresentation';

describe('resolveCommandPaletteDarkSnapshot', () => {
    it('honors the persisted preference read when the palette opens', () => {
        expect(resolveCommandPaletteDarkSnapshot({
            currentThemeIsDark: false,
            themePreference: 'dark',
        })).toBe(true);
        expect(resolveCommandPaletteDarkSnapshot({
            currentThemeIsDark: true,
            themePreference: 'light',
        })).toBe(false);
        expect(resolveCommandPaletteDarkSnapshot({
            currentThemeIsDark: true,
            themePreference: 'adaptive',
        })).toBe(true);
    });
});

describe('resolveStudioOverlayDarkMode', () => {
    it('uses the persisted fixed preference across modal roots', () => {
        expect(resolveStudioOverlayDarkMode({
            runtimeThemeName: 'light',
            themePreference: 'dark',
        })).toBe(true);
        expect(resolveStudioOverlayDarkMode({
            runtimeThemeName: 'dark',
            themePreference: 'light',
        })).toBe(false);
    });

    it('uses the system scheme only for adaptive mode', () => {
        expect(resolveStudioOverlayDarkMode({
            runtimeThemeName: 'dark',
            themePreference: 'adaptive',
        })).toBe(true);
        expect(resolveStudioOverlayDarkMode({
            runtimeThemeName: 'light',
            themePreference: 'adaptive',
        })).toBe(false);
    });
});

describe('resolveStudioOverlayPresentation', () => {
    it('enables Studio overlay styling only for the packaged desktop runtime', () => {
        expect(resolveStudioOverlayPresentation({
            isDark: false,
            isTauriRuntime: true,
            requestedStyle: 'studio',
        })).toMatchObject({
            isStudio: true,
            commandPalette: {
                backdropPeakOpacity: 1,
                categoryFontSize: 11,
                categoryPaddingBottom: 6,
                categoryPaddingHorizontal: 20,
                categoryPaddingTop: 12,
                contentMaxWidth: 640,
                emptyPadding: 32,
                inputFontSize: 16,
                inputPaddingHorizontal: 20,
                inputPaddingVertical: 16,
                itemBorderWidth: 1,
                itemIconContainerSize: 28,
                itemIconMarginRight: 10,
                itemIconSize: 18,
                itemMarginVertical: 1,
                itemPaddingHorizontal: 16,
                itemPaddingVertical: 8,
                itemSubtitleFontSize: 12,
                itemTitleFontSize: 14,
                resultsMaxHeightWeb: '38vh',
                resultsPaddingVertical: 6,
                shellMaxHeightWeb: '52vh',
                shortcutPaddingHorizontal: 8,
                shortcutPaddingVertical: 3,
            },
            floating: {
                borderWidth: 1,
                radius: 17,
                shadowOffsetY: 8,
                shadowOpacity: 0.1,
                shadowRadius: 24,
                surfaceColor: 'rgba(255, 255, 255, 0.96)',
            },
            focusRingColor: 'rgba(70, 111, 226, 0.82)',
            modal: {
                radius: 16,
                scrimColor: 'rgba(0, 0, 0, 0.10)',
            },
            selectedBorderColor: 'rgba(70, 111, 226, 0.34)',
        });

        expect(resolveStudioOverlayPresentation({
            isDark: false,
            isTauriRuntime: false,
            requestedStyle: 'studio',
        })).toMatchObject({
            isStudio: false,
            commandPalette: {
                contentMaxWidth: 0,
                inputPaddingVertical: 0,
                itemPaddingVertical: 0,
            },
        });

        expect(resolveStudioOverlayPresentation({
            isDark: false,
            isTauriRuntime: true,
            requestedStyle: 'default',
        }).isStudio).toBe(true);
    });

    it('keeps the provisional modal tier distinct and ignores stale preview preferences', () => {
        const presentation = resolveStudioOverlayPresentation({
            isDark: true,
            isTauriRuntime: true,
            previewStyle: 'studio',
            requestedStyle: 'default',
        });

        expect(presentation.isStudio).toBe(true);
        expect(presentation.focusRingColor).toBe('rgba(132, 168, 255, 0.88)');
        expect(presentation.selectedBorderColor).toBe('rgba(132, 168, 255, 0.52)');
        expect(presentation.modal.shadowRadius).not.toBe(presentation.floating.shadowRadius);
        expect(presentation.modal.scrimColor).toBe('rgba(0, 0, 0, 0.24)');
        expect(presentation.floating.clickAwayColor).toBe('transparent');

        expect(resolveStudioOverlayPresentation({
            isDark: false,
            isTauriRuntime: true,
            previewStyle: 'default',
            requestedStyle: 'studio',
        }).isStudio).toBe(true);
    });
});

describe('resolveSessionActionsMenuPosition', () => {
    it('preserves point-anchor positioning and clamps only at the viewport edge', () => {
        expect(resolveSessionActionsMenuPosition({
            actionCount: 2,
            anchor: { type: 'point', x: 420, y: 160 },
            itemHeight: 48,
            margin: 12,
            menuWidth: 288,
            windowHeight: 720,
            windowWidth: 1200,
        })).toEqual({ left: 420, top: 160 });
    });

    it('opens below a rectangular anchor when space is available', () => {
        expect(resolveSessionActionsMenuPosition({
            actionCount: 3,
            anchor: { type: 'rect', x: 220, y: 80, width: 32, height: 32 },
            itemHeight: 48,
            margin: 12,
            menuWidth: 288,
            windowHeight: 720,
            windowWidth: 1200,
        })).toEqual({ left: 12, top: 120 });
    });

    it('flips above and clamps the menu to the viewport using the existing geometry', () => {
        expect(resolveSessionActionsMenuPosition({
            actionCount: 5,
            anchor: { type: 'rect', x: 1140, y: 650, width: 32, height: 32 },
            itemHeight: 48,
            margin: 12,
            menuWidth: 288,
            windowHeight: 720,
            windowWidth: 1200,
        })).toEqual({ left: 884, top: 402 });
    });
});
