import { describe, expect, it } from 'vitest';
import {
    resolveDesktopSectionHeaderStyle,
    resolveDesktopSidebarFooterStyle,
    resolveDesktopSessionRowStyle,
    resolveDesktopTodoRowStyle,
    resolveDesktopTopControlsStyle,
    resolveDesktopVisualStyle,
    resolveDesktopSidebarFrame,
} from './studioVisualStyle';

describe('Studio desktop visual style', () => {
    it('forces the Studio sidebar when a packaged desktop still requests Default', () => {
        expect(resolveDesktopSidebarFrame({
            windowWidth: 1470,
            isTauriRuntime: true,
            requestedStyle: 'default',
        })).toMatchObject({
            visualStyle: 'studio',
            width: 316,
            sidebarBackground: '#F6F7F7',
            canvasBackground: '#FFFFFF',
            dividerWidth: 1,
        });
    });

    it('resolves the accepted 316 point Studio frame at the review width', () => {
        expect(resolveDesktopSidebarFrame({
            windowWidth: 1470,
            isTauriRuntime: true,
            requestedStyle: 'studio',
        })).toEqual({
            visualStyle: 'studio',
            width: 316,
            sidebarBackground: '#F6F7F7',
            canvasBackground: '#FFFFFF',
            dividerColor: '#E5E5E6',
            dividerWidth: 1,
        });
    });

    it('keeps Studio responsive within the existing desktop bounds', () => {
        expect(resolveDesktopSidebarFrame({
            windowWidth: 900,
            isTauriRuntime: true,
            requestedStyle: 'studio',
        }).width).toBe(250);
        expect(resolveDesktopSidebarFrame({
            windowWidth: 1800,
            isTauriRuntime: true,
            requestedStyle: 'studio',
        }).width).toBe(360);
    });

    it('forces standalone web and native clients back to Default', () => {
        expect(resolveDesktopVisualStyle({
            isTauriRuntime: false,
            requestedStyle: 'studio',
            previewStyle: 'studio',
        })).toBe('default');
    });

    it('keeps packaged desktop on Studio even with a stale Default preview', () => {
        expect(resolveDesktopVisualStyle({
            isTauriRuntime: true,
            requestedStyle: 'default',
            previewStyle: 'default',
        })).toBe('studio');
    });

    it('resolves a compact regular-weight Studio session row', () => {
        expect(resolveDesktopSessionRowStyle({
            isTauriRuntime: true,
            requestedStyle: 'studio',
        })).toEqual({
            visualStyle: 'studio',
            height: 58,
            horizontalInset: 12,
            horizontalPadding: 12,
            verticalPadding: 4,
            gap: 2,
            leadingIndicatorWidth: 10,
            leadingIndicatorGap: 6,
            metadataInset: 16,
            titleFontSize: 13,
            titleLineHeight: 17,
            titleFontWeight: '400',
            primaryMetadataFontSize: 11,
            secondaryMetadataFontSize: 10,
            cornerRadius: 7,
            selectedBackground: '#E8EAEA',
            showCardSurface: false,
            showGroupShellBoundary: false,
            showRowDividers: false,
            showShadow: false,
        });
    });

    it('keeps non-Tauri session rows on their existing Default style path', () => {
        expect(resolveDesktopSessionRowStyle({
            isTauriRuntime: false,
            requestedStyle: 'default',
        })).toMatchObject({
            visualStyle: 'default',
            leadingIndicatorWidth: null,
            leadingIndicatorGap: null,
            metadataInset: null,
            titleFontSize: null,
            secondaryMetadataFontSize: null,
            showGroupShellBoundary: true,
        });
        expect(resolveDesktopSessionRowStyle({
            isTauriRuntime: false,
            requestedStyle: 'studio',
            previewStyle: 'studio',
        }).visualStyle).toBe('default');
    });

    it('resolves transparent compact Studio top-navigation rows', () => {
        expect(resolveDesktopTopControlsStyle({
            isTauriRuntime: true,
            requestedStyle: 'studio',
        })).toEqual({
            visualStyle: 'studio',
            controlHeight: 36,
            archiveWidth: 36,
            cornerRadius: 7,
            groupGap: 2,
            contentGap: 6,
            horizontalPadding: 12,
            showRestingBorder: false,
            showRestingSurface: false,
            showShadow: false,
        });
    });

    it('keeps non-Tauri top controls on their existing style path', () => {
        expect(resolveDesktopTopControlsStyle({
            isTauriRuntime: false,
            requestedStyle: 'default',
        })).toMatchObject({
            controlHeight: null,
            showRestingBorder: true,
            showRestingSurface: true,
        });
        expect(resolveDesktopTopControlsStyle({
            isTauriRuntime: false,
            requestedStyle: 'studio',
            previewStyle: 'studio',
        }).visualStyle).toBe('default');
    });

    it('resolves the Todo action with the same transparent navigation grammar', () => {
        expect(resolveDesktopTodoRowStyle({
            isTauriRuntime: true,
            requestedStyle: 'studio',
        })).toEqual({
            visualStyle: 'studio',
            height: 36,
            cornerRadius: 7,
            horizontalPadding: 12,
            contentGap: 4,
            showRestingBorder: false,
            showRestingSurface: false,
            showShadow: false,
        });
    });

    it('keeps non-Tauri Todo rows on their existing style path', () => {
        expect(resolveDesktopTodoRowStyle({
            isTauriRuntime: false,
            requestedStyle: 'default',
        })).toMatchObject({
            height: null,
            showRestingBorder: true,
            showRestingSurface: true,
        });
        expect(resolveDesktopTodoRowStyle({
            isTauriRuntime: false,
            requestedStyle: 'studio',
            previewStyle: 'studio',
        }).visualStyle).toBe('default');
    });

    it('resolves the accepted compact Studio section-header geometry', () => {
        expect(resolveDesktopSectionHeaderStyle({
            isTauriRuntime: true,
            requestedStyle: 'studio',
        })).toEqual({
            visualStyle: 'studio',
            fontSize: 11,
            lineHeight: 15,
            fontWeight: '500',
            horizontalPadding: 18,
            topPadding: 10,
            bottomPadding: 4,
        });
    });

    it('keeps non-Tauri section headers on their existing style path', () => {
        expect(resolveDesktopSectionHeaderStyle({
            isTauriRuntime: false,
            requestedStyle: 'default',
        }).fontSize).toBeNull();
        expect(resolveDesktopSectionHeaderStyle({
            isTauriRuntime: false,
            requestedStyle: 'studio',
            previewStyle: 'studio',
        }).visualStyle).toBe('default');
    });

    it('resolves the compact Studio sidebar footer hierarchy', () => {
        expect(resolveDesktopSidebarFooterStyle({
            isTauriRuntime: true,
            requestedStyle: 'studio',
        })).toEqual({
            visualStyle: 'studio',
            height: 44,
            horizontalPadding: 18,
            contentGap: 9,
            iconSize: 17,
            labelFontSize: 13,
        });
    });

    it('keeps non-Tauri sidebar footers on their existing style path', () => {
        expect(resolveDesktopSidebarFooterStyle({
            isTauriRuntime: false,
            requestedStyle: 'default',
        }).height).toBeNull();
        expect(resolveDesktopSidebarFooterStyle({
            isTauriRuntime: false,
            requestedStyle: 'studio',
            previewStyle: 'studio',
        }).visualStyle).toBe('default');
    });
});
